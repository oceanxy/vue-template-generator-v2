import './index.scss'
import { computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import useStore from '@/composables/tgStore'
import router from '@/router'
import { getValueFromStringKey } from '@/utils/utilityFunction'
import { message, Table } from 'ant-design-vue'
import useThemeVars from '@/composables/themeVars'
import { omit, throttle } from 'lodash'
import { verificationDialog } from '@/utils/message'

/**
 *
 * @param props {import('ant-design-vue').Table.tableProps} - 表格属性。
 * @param [location] {string} - 次级表格的 state。
 * @param [stateName] {string} - 表格数据源的属性名，默认 'dataSource'。
 * @param [isInjectRouterQuery=true] {boolean} - 是否自动注入路由的 query 参数，默认 true。
 * 注意此参数为 true 时，表格的请求参数会被路由 query 中的同名参数覆盖。
 * @param [getDataSource] {(store: import('pinia').defineStore) => any} - 自定义数据源的取值逻辑。
 * 默认为`store => location ? store[location].dataSource.list : store.dataSource.list`
 * @param [showSerialNumberColumn=true] {boolean} - 是否显示序号列，默认 true。
 * @param [optionForGetList] {Object} - getList 函数参数。
 * @param [tableName] {string} - 表格名称，用于在子组件中获取表格 ref。
 * @returns {{}|string}
 */
export default function useTGTable({
  stateName = 'dataSource',
  location,
  isInjectRouterQuery,
  getDataSource,
  props = {},
  showSerialNumberColumn = true,
  optionForGetList,
  tableName
} = {}) {
  let observer = null
  let timer = null

  const inModal = inject('inModal', null)
  const hasTree = inject('hasTree', null)
  const refreshTree = inject('refreshTree', null)
  const getRefOfChild = inject('getRefOfChild', null)

  const { token } = useThemeVars()
  let store = useStore()

  const tableRef = ref(null)
  const exportButtonDisabled = ref(false)

  const currentItem = computed(() => store.currentItem)
  const dataSource = computed(() => {
    if (typeof getDataSource === 'function') {
      return getDataSource(store)
    } else if (location) {
      return store[location][stateName].list
    } else {
      return store[stateName].list
    }
  })

  let pagination
  let currentPageStartNumber
  let loading
  let selectedRowKeys
  let selectedRows
  let sortFieldList

  if (!location) {
    /** 主表格逻辑 **/
    pagination = computed(() => store.pagination)
    currentPageStartNumber = computed(() => {
      return (pagination.value?.pageIndex ?? 0) * (pagination.value?.pageSize ?? 10)
    })
    loading = computed(() => store[stateName].loading)
    selectedRowKeys = computed(() => store.selectedRowKeys)
    selectedRows = computed(() => store.selectedRows)
    sortFieldList = computed(() => store.sortFieldList)
  } else {
    /** 弹窗内表格等附表格逻辑 **/
    pagination = computed(() => store[location].pagination)
    currentPageStartNumber = computed(() => {
      return (pagination.value?.pageIndex ?? 0) * (pagination.value?.pageSize ?? 10)
    })
    loading = computed(() => store[location][stateName].loading)
    selectedRowKeys = computed(() => store[location].selectedRowKeys)
    selectedRows = computed(() => store[location].selectedRows)
    sortFieldList = computed(() => store[location].sortFieldList)
  }

  const serialNumberColumn = [
    {
      title: '序号',
      width: 70,
      align: 'center',
      fixed: true,
      customRender: ({ record, index }) => {
        record._sn = index + 1 + currentPageStartNumber.value

        return record._sn
      }
    }
  ]

  const defaultTableProps = reactive({
    rowKey: store.rowKey || 'id',
    dataSource: [],
    columns: showSerialNumberColumn
      ? [
        ...serialNumberColumn,
        ...props.columns
      ]
      : props.columns,
    loading,
    rowSelection: props.rowSelection
      ? {
        selections: true,
        fixed: true,
        columnWidth: 50,
        onChange: onRowSelectionChange,
        selectedRowKeys: [],
        ...props.rowSelection
      }
      : null,
    pagination: props.pagination !== false
      ? {
        showQuickJumper: true,
        showTotal: total => `共 ${total} 条数据`,
        size: 'large',
        ...props.pagination
      }
      : false,
    // 注意：scroll属性不要手动设置，在this.resize方法内已经自动分配。
    // 此外，这里会引发报错：ResizeObserver loop completed with undelivered notifications。
    // 具体信息可以参考：https://juejin.cn/post/7262623363700981797
    // scroll: { x: '100%', y: 500 },
    tableLayout: 'fixed',
    size: 'middle',
    bordered: true,
    rowClassName(record, index) {
      return index % 2 === 1 ? 'table-row-background' : ''
    },
    onChange
  })

  watch(selectedRowKeys, value => {
    if (defaultTableProps.rowSelection) {
      defaultTableProps.rowSelection.selectedRowKeys = value
    }
  }, { immediate: true })

  // 监听排序集合，根据后端返回的值初始化表头
  watch(sortFieldList, value => {
    value?.map(sort => {
      const index = defaultTableProps.columns.findIndex(column => {
        if (typeof sort === 'function') {
          return column.dataIndex === sort.fieldCode
        } else {
          return column.dataIndex === sort
        }
      })

      if (index !== -1) {
        defaultTableProps.columns.splice(index, 1, {
          ...defaultTableProps.columns[index],
          sorter: true,
          sortCode: sort
        })
      }
    })
  })

  // 为 list 创建动态侦听器
  watch(dataSource, async value => {
    defaultTableProps.dataSource = value

    await resize()
  })

  if (props.pagination !== false) {
    watch(pagination, value => {
      defaultTableProps.pagination.total = value.total
      defaultTableProps.pagination.pageSize = value.pageSize
      defaultTableProps.pagination.current = value.pageIndex + 1
    }, { deep: true })
  }

  /**
   * 获取列表数据
   * @param {string} [stateName] -
   * @param {Object} [paramsForGetList] -
   * @param {boolean} [isMergeParam=false] - 是否合并数据，默认false，优先级低于 isInjectRouterQuery。
   * @param {boolean} [isPagination] -
   * @returns {Promise<void>}
   */
  async function fetchList({
    paramsForGetList,
    isMergeParam = false,
    isPagination = false
  } = {}) {
    if (!location) {
      return await store.getList({
        stateName,
        paramsForGetList: {
          ...paramsForGetList,
          ...(isInjectRouterQuery ? router.currentRoute.value.query : {})
        },
        isMergeParam: isInjectRouterQuery || isMergeParam,
        isPagination
      })
    } else {
      if (!optionForGetList?.apiName) {
        throw new Error('location 为真值时，apiName 必传。')
      }

      return await store.getList({
        location,
        stateName,
        apiName: optionForGetList?.apiName,
        setValueToStateName: optionForGetList?.setValueToStateName,
        paramsForGetList: optionForGetList?.getParams?.(currentItem),
        isMergeParam: true
      })
    }
  }

  /**
   * 行内改变状态，支持批量操作。
   * @param checked {boolean} - 当前控件的选中状态。
   * @param record {Object|Object[]} - 列表数据对象或对象集合。
   * @param [fieldName='status'] {string} - 自定义传递状态值给接口的参数名。默认 'status'。
   * @param [actualFieldName='status'] {string} - 数据列表中实际用于保存该状态的字段名，用于乐观更新或还原本地数据。默认 'status'。
   * @param [idKey='id'] {string} - 自定义传递唯一标识符给接口的参数名。为了适配某些接口可能接收`ids`为参数名的情况，默认 'id'。
   * @param [getIds=(record) => record.id] {(Object) => string} - 从数据对象中获取唯一标识符，默认取`record`的`id`字段。
   * @param [nameKey='fullName'] {string} - 指定 record 数据对象中用来显示的字段名，主要用于操作之后的提示信息。 默认 'fullName'。
   *  例如：`$｛fullName｝的状态已更新！`
   * @param [apiName] {string} - 自定义接口名，默认为`update[moduleName][fieldName]}`，采用驼峰命名。
   * @param [stateName='dataSource'] {string} - store.state 中存储该表格数据的字段名，默认 'dataSource'。
   * @param [optimisticUpdate=true] {boolean} - 乐观更新，是否在成功调用更新接口后向服务器请求新的列表数据。
   *  默认`true`，使用乐观更新，即不向服务器请求新的列表数据，前端执行乐观更新操作。
   * @param [customStatusValue=｛OPENED:1, CLOSED:2｝] {object} - 自定义状态值与参数值的映射关系，默认`{OPENED：1，CLOSED：2}`。
   * @returns {Promise<void>}
   */
  async function onStatusChange({
    checked,
    record,
    fieldName = 'status',
    actualFieldName = 'status',
    idKey = 'id',
    getIds = record => record.id,
    nameKey = 'fullName',
    apiName,
    stateName = 'dataSource',
    customStatusValue = { OPENED: 1, CLOSED: 2 },
    optimisticUpdate = true
  } = {}) {
    if (typeof getIds !== 'function') {
      throw new Error('getIds 必须是一个函数')
    }

    const isBulkOperation = Array.isArray(record)
    let ids

    if (isBulkOperation) {
      ids = record?.map(item => getIds(item))
    } else {
      ids = [getIds(record)]
    }

    if (ids.some(id => !id)) {
      throw new Error(`获取操作行的ID时出现异常，请检查ID是否存在，或 getIds 函数是否正确定义。`)
    }

    const status = await store.updateRowStatus({
      location,
      fieldName,
      stateName,
      apiName,
      payload: {
        [idKey]: isBulkOperation ? ids : ids[0],
        [fieldName]: checked ? customStatusValue.OPENED : customStatusValue.CLOSED
      }
    })

    if (status) {
      // 适配`nameKey`的值为`a.b`的形式，解析为`record[a][b]`
      const name = getValueFromStringKey(nameKey, record)

      if (isBulkOperation) {
        message.success('批量更新状态已完成！')
      } else {
        message.success([
          <span style={{ color: `${token.value.colorPrimary}` }}>
            {name}
          </span>,
          '的状态已更新！'
        ])
      }

      if (optimisticUpdate) {
        let dataSource

        if (typeof getDataSource === 'function') {
          dataSource = getDataSource(store)
        } else {
          const _dataSource = location ? store[location][stateName] : store[stateName]
          // _dataSource.list 取值是为了适配 store.state 中定义为 “{ loading: false, list: [] }” 结构的数据类型。
          dataSource = Array.isArray(_dataSource)
            ? _dataSource
            : _dataSource.list || []
        }

        // 提升性能的关键，将 id 与 index 建立映射关系，方便快速查找。
        const idToIndexMap = new Map(dataSource.map((item, index) => [getIds(item), index]))
        const updateStatus = id => {
          const index = idToIndexMap.get(id)

          if (index !== undefined) {
            dataSource[index][actualFieldName] = checked ? customStatusValue.OPENED : customStatusValue.CLOSED
          }
        }

        // 更新 store 里的值
        if (isBulkOperation) {
          ids.forEach(id => updateStatus(id))
        } else {
          updateStatus(getIds(record))
        }
      } else {
        await fetchList()
      }
    }
  }

  /**
   * 行内新增
   * @param initialValue {Object} 初始化默认值
   * @param parentId {string} 父级ID
   * @returns {Promise<void>}
   */
  function onAddClick(initialValue, parentId) {
    store.setVisibilityOfModal({
      currentItem: {
        _parentId: parentId,
        ...omit(initialValue, 'id')
      }
    })
  }

  /**
   * 编辑
   * @param record {Object} 列表数据对象
   * @returns {Promise<void>}
   */
  function onEditClick(record) {
    store.setVisibilityOfModal({
      currentItem: record
    })
  }

  /**
   * 审核或相关意见填写
   * @param record {Object}
   * @param visibilityFieldName {string}
   * @returns {Promise<void>}
   */
  function onAuditClick(record, visibilityFieldName) {
    store.setVisibilityOfModal({
      currentItem: record,
      visibilityFieldName
    })
  }

  /**
   * 查看详情
   * @param record {Object}
   * @returns {Promise<void>}
   */
  function onDetailsClick(record) {
    store.setVisibilityOfModal({
      currentItem: {
        ...record,
        _disabled: true
      }
    })
  }

  /**
   * 删除
   * @param record {{_isFreshTree: boolean, [key: string]: any }} - 列表数据对象
   * ```json
   *  {
   *    ...record,
   *    // 是否刷新侧边树，默认false; 当在本表格组件处于侧边树的下级时默认true，所以此时需要显示定义该字段为 false
   *    _isFreshTree: boolean
   *  }
   *  ```
   * @param [options={}] 其他配置
   * @config [isBulkOperation=true] {boolean} 是否批量操作，默认 true。该参数会改变 idFieldName 的默认行为。
   *  在没有显示的设置 idFieldName 的情况下：
   *  - 该值为 false 时，idFieldName 默认值为 'id'
   *  - 该值为 true 时，idFieldName 默认值为 'ids'
   * @config [idFieldName='id'|'ids'] {string} 删除接口用于接收删除ID的字段名，默认值受 isBulkOperation 影响。
   * @config [params] {Object} - 其他删除参数。
   * @config [done] {() => void} - 成功执行删除的回调
   * @config [nameKey='fullName'] {string} - 在删除提示中显示当条数据中的某个字段信息
   * @config [message] {string} - 自定义提示文案。
   */
  async function onDeleteClick(record, options = {}) {
    // 处理 options 的默认值
    options = {
      isBulkOperation: true,
      nameKey: 'fullName',
      ...options
    }

    await verificationDialog(
      async () => {
        if (!('idFieldName' in options)) {
          if (options.isBulkOperation) {
            options.idFieldName = 'ids'
          } else {
            options.idFieldName = 'id'
          }
        }

        const status = await store.deleteRow({
          payload: {
            ...options.params,
            [options.idFieldName]: options.isBulkOperation ? [record.id] : record.id
          },
          isBulkOperation: options.isBulkOperation,
          idFieldName: options.idFieldName,
          stateName,
          paramsForGetList: isInjectRouterQuery ? router.currentRoute.value.query : {}
        })

        if (status) {
          // 执行侧边树数据更新
          if (hasTree && (record._isFreshTree !== false)) {
            await refreshTree?.()
          }

          if (typeof options.done === 'function') {
            options.done()
          }
        }

        return status
      },
      options.message ? options.message : ' 确定要删除吗？',
      record[options.nameKey]
        ? [
          <span style={{ color: token.value.colorPrimary }}>{record[options.nameKey]}</span>,
          ' 已成功删除！'
        ]
        : '删除成功！'
    )
  }

  /**
   * 表格行change事件回调
   * @param selectedRows {Object[]} - 当前页选中的数据对象
   * @returns {Promise<void>}
   */
  function onRowSelectionChange(selectedRows) {
    store.setState('selectedRows', selectedRows)
  }

  /**
   * 导出数据
   * @param payload {Object} 参数
   * @param [fileName] {string} 文件名称，默认路由名称（route.meta.title）
   * @param [visibilityFieldName] 成功导出后需要关闭的弹窗控制字段，一般在弹出
   * @returns {Promise<void>}
   */
  async function onExport({
    params,
    fileName,
    visibilityFieldName
  }) {
    message.loading({ content: '正在导出，请稍候...', duration: 0 })

    exportButtonDisabled.value = true

    await store.exportData({
      params,
      fileName: fileName || router.currentRoute.value.meta.title,
      visibilityFieldName
    })

    exportButtonDisabled.value = false
    message.destroy()
  }

  /**
   * antd vue Table 的 change 事件
   * 分页、排序、筛选变化时触发
   * @param pagination
   * @param filters
   * @param sorter
   * @returns {Promise<void>}
   */
  async function onChange(pagination, filters, sorter) {
    store.$patch({
      pagination: {
        pageIndex: pagination.current - 1,
        pageSize: pagination.pageSize
      },
      // 排序变了，序号也重新计算了，所以需要清空已选择的行数据
      selectedRows: []
    })

    await fetchList({
      // 组装后端接收的排序参数
      paramsForGetList: {
        sortField: sorter.order ? sorter.field : undefined,
        sortType: sorter.order ? sorter.order.replace('end', '') : undefined
      },
      isMergeParam: true,
      isPagination: true
    })
  }

  /**
   * 重新布局，根据页面大小判断是否显示Table组件的滚动条
   * 当且仅当对应store内的state.list发生变化时会自动调用，其余情况请手动调用;
   * 调用方式：建议在监听渲染表格的数据变化时调用
   */
  async function resize() {
    await nextTick()

    // .tg-table 容器
    const TABLE_WRAPPER = tableRef.value?.$el

    if (TABLE_WRAPPER && defaultTableProps.dataSource.length) {
      const scroll = { x: '100%' }

      const TABLE_CONTAINER = TABLE_WRAPPER.querySelector('.ant-table .ant-table-container')
      const TABLE_CONTENT = TABLE_CONTAINER.querySelector('.ant-table-content')

      if (TABLE_CONTENT) {
        if (TABLE_CONTENT.clientHeight >= TABLE_CONTAINER.clientHeight) {
          scroll.y = TABLE_CONTAINER.clientHeight
        }
      } else {
        const TABLE_HEADER = TABLE_CONTAINER.querySelector('.ant-table-header')
        const TABLE_BODY = TABLE_CONTAINER.querySelector('.ant-table-body')

        if (TABLE_HEADER.clientHeight + TABLE_BODY.clientHeight >= TABLE_CONTAINER.clientHeight) {
          scroll.y = TABLE_HEADER.clientHeight + TABLE_BODY.clientHeight
        }
      }

      defaultTableProps.scroll = scroll
    }
  }

  function clearSelectedRows() {
    store.setState('selectedRows', [])
  }

  function observerCallback() {
    // 设置延迟是因为 .tg-inquiry-form 容器 和 .tg-collapsed-chart 容器 的 css过渡动画时间为200ms
    timer = setTimeout(resize, 200)
  }

  function resizeCallback() {
    // return debounce(resize, 200)
    return throttle(resize, 200)
  }

  onMounted(async () => {
    // 为上级组件注入获取 table ref 的逻辑
    if (getRefOfChild instanceof Function) {
      getRefOfChild(tableRef
        // props.tableName
        //   ? this.$refs[this.tableName]
        //   : this.$refs[`${this.submoduleName ? `${this.submoduleName}Of` : ''}${this.tgStore}Table`]
      )
    }

    if (inModal) {
      await fetchList()
    } else {
      window.addEventListener('resize', resizeCallback())

      // tg-inquiry-form 为可变高度的容器，这里监听一下该容器的高度变化，用来重置表格的高度
      const inquiryForm = document.querySelector('.tg-inquiry-form')
      const collapsedChart = document.querySelector('.tg-collapsed-chart')

      if (inquiryForm || collapsedChart) {
        const MutationObserver = window.MutationObserver ||
          window.WebKitMutationObserver ||
          window.MozMutationObserver

        observer = new MutationObserver(observerCallback)

        inquiryForm && observer.observe(inquiryForm, {
          attributes: true,
          attributeFilter: ['class']
        })

        collapsedChart && observer.observe(collapsedChart, {
          attributes: true,
          attributeFilter: ['class']
        })
      }
    }
  })

  onBeforeUnmount(() => {
    clearSelectedRows()

    if (!inModal) {
      timer = null
      window.removeEventListener('resize', resizeCallback())

      if (observer) {
        observer.disconnect()
        observer.takeRecords()
        observer = null
      }
    }
  })

  function TGTable() {
    return (
      <Table
        ref={tableRef}
        class={'tg-table'}
        {...defaultTableProps}
      />
    )
  }

  return {
    currentItem,
    dataSource,
    onChange,
    TGTable,
    onStatusChange
  }
}
