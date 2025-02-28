import './assets/styles/index.scss'
import { Input, Spin, Tree } from 'ant-design-vue'
import { sleep } from '@/utils/utilityFunction'
import TGContainerWithSider from '@/components/TGContainerWithSider'
import { cloneDeep, debounce } from 'lodash'
import { computed, inject, onBeforeMount, provide, ref, watch } from 'vue'
import useStore from '@/composables/tgStore'
import router from '@/router'
import { CaretDownOutlined, SearchOutlined } from '@ant-design/icons-vue'
import configs from '@/configs'

export default {
  name: 'TGContainerWithTreeSider',
  props: {
    /**
     * 获取自定义图标
     * @param treeNode {Tree.TreeNode} 树节点
     * @returns Icon.component 控制如何渲染图标，通常是一个渲染根标签为 <svg> 的 Vue 组件，会使 type 属性失效
     */
    getCustomIcon: {
      type: Function,
      default: undefined
    },
    /**
     * 内容区额外样式表名
     */
    contentClass: {
      type: String,
      default: ''
    },
    /**
     * 获取侧边栏树的数据的相关配置
     *  treeDataOptions.apiName: API名称
     *  treeDataOptions.storeName: 存放树的数据的 store 名称，默认树所在页面对应的模块
     *  treeDataOptions.stateName: 存放树的数据的字段名，默认`dataSource`
     */
    treeDataOptions: {
      type: Object,
      default: () => ({})
    },
    /**
     * 默认展开的树节点ID
     * 默认展开所有层级的第一个子节点
     */
    defaultExpandedKeys: {
      type: Array,
      default: () => []
    },
    /**
     * 非空模式，默认关闭，不选中任何一级
     * 开启后，当树没有选中值时（即selectedKeys为空数组时），自动选中树的最顶层菜单，然后触发所在页面的列表获取数据。
     */
    notNoneMode: {
      type: Boolean,
      default: false
    },
    /**
     * 选中树后用于搜索列表的字段名，默认 'treeId'，可能改为 'parentId'
     * @param hierarchy {number} 树节点层级
     * @returns {string}
     */
    getFieldNameForTreeId: {
      type: Function,
      default: hierarchy => 'treeId'
    },
    /**
     * 向 store.state.search 对象注入其他参数。
     * 注意一般不需要此操作，仅使用 props.getFieldNameForTreeId 参数即可，但是在某些特殊场景，
     * 比如在操作树时需要传递多个字段给查询接口时，可以使用该prop来配置其余参数。
     * @param dataSource {Object} 用于渲染树节点的数据对象
     * @returns {Object} 需要合并注入到 search 的对象
     */
    injectSearchParamsOfTable: {
      type: Function,
      default: dataSource => ({})
    },
    /**
     * 搜索框提示文本
     */
    placeholder: {
      type: String,
      default: '请输入关键字搜索'
    },
    /**
     * 用于触发树更新的 action 集合。
     * 监听本组件所在页面的所有 action，当设定的 action 被触发时，则触发树更新。通常用在页面列表数据和树数据需要保持同步的场景。
     */
    actionsForUpdateTree: {
      type: Array,
      default: () => []
    },
    /**
     * 替换 treeNode 中 title,key,children 字段为 treeData 中对应的字段。
     * 参考 https://1x.antdv.com/components/tree-cn/#API
     */
    fieldNames: {
      type: Object,
      default: () => ({
        children: 'children',
        title: 'name',
        key: 'id'
      })
    }
  },
  setup(props, { slots }) {
    const initSearchParameters = inject('initSearchParameters')

    const store = useStore()
    let treeStore

    const storeName = props.treeDataOptions?.storeName ?? router.currentRoute.value.name
    const stateName = props.treeDataOptions?.stateName ?? 'dataSource'

    if (storeName.value === router.currentRoute.value.name) {
      if (stateName === 'dataSource') {
        console.warn(`${router.currentRoute.value.name} 页面的筛选树数据将覆盖本页面的表格数据（store.state.dataSource），可能发生意料之外的问题！`)
      }

      treeStore = store
    } else {
      treeStore = useStore(storeName)
    }

    const _dataSource = ref([])
    const dataSource = computed(() => treeStore[stateName].list)
    const loading = computed(() => treeStore[stateName].loading)
    const tableRef = ref(null)
    const status = ref(false)
    const defaultExpandedTreeIds = ref([])
    const searchValue = ref('')
    const expandedKeysFormEvent = ref([])
    // 上一次设置的用于保存树选中值的字段名，
    // （通常用于 treeIdField 会发生变化的时候。如点击树的不同层级，传递的字段名不一样的情况）
    const oldTreeIdField = ref('')
    // 是否是手动折叠树默。仅当触发onExpand事件为折叠状态时，给isCollapsedManually赋值为true
    const isCollapsedManually = ref(false)
    const treeIdField = computed(() => store.treeIdField)
    const treeId = computed(() => [store.search[treeIdField.value]])
    const expandedKeys = computed(() => {
      if (expandedKeysFormEvent.value.length) {
        return expandedKeysFormEvent.value
      }

      // 展开所有搜索结果（一般在搜索树时使用，搜索树时会清空 expandedKeysFormEvent 数组）
      if (searchValue.value) {
        return getAllParentIds(dataSource.value)
      }

      if (isCollapsedManually.value) {
        return expandedKeysFormEvent.value
      }

      // 默认展开的树节点，如果 defaultExpandedTreeIds 为空，则默认展开所有层级的第一个子节点
      return defaultExpandedTreeIds.value?.length
        ? defaultExpandedTreeIds.value
        : getAllParentIds(dataSource.value, true)
    })

    provide('getRefOfChild', ref => tableRef.value = ref)
    /**
     * 通知下层组件在初始化阶段是否自动请求数据。依赖 props.notNoneMode。
     *  false：本组件不控制下层组件在组件创建阶段（created 生命周期）的数据请求，默认;
     *  true：下层组件在创建阶段不请求数据
     */
    // provide('notInitList', props.notNoneMode) // 被废弃
    /**
     * 通知下层组件，当前页面是否启用侧边树
     */
    provide('hasTree', true)
    // 向 inquiryForm 注入树的搜索参数字段名
    provide('searchParamNameRequired', [
      props.getFieldNameForTreeId(),
      ...Object.keys(props.injectSearchParamsOfTable({}))
    ])
    /**
     * 向下层组件提供直接刷新左侧树的API
     */
    provide('refreshTree', getTree)

    watch(searchValue, value => {
      _dataSource.value = filter(dataSource.value, value)
    })

    /**
     * 获取树的渲染数据
     * @returns {Promise<any>}
     */
    async function getTree() {
      return await treeStore.getList({
        stateName: props.treeDataOptions?.stateName,
        apiName: props.treeDataOptions.apiName
      })
    }

    /**
     * 获取所有父节点的ID
     * @param dataSource {Array}
     * @param [onlyFirstParentNode=false] {boolean} 仅获取每个层级的第一个子节点的ID
     * @returns {*[]}
     */
    function getAllParentIds(dataSource, onlyFirstParentNode) {
      let ids = []
      const keyField = props.fieldNames.key
      const childrenField = props.fieldNames.children

      for (const item of dataSource) {
        if (
          item.isParent ||
          (
            Array.isArray(item[childrenField]) &&
            item[childrenField]?.length
          )
        ) {
          ids.push(item[keyField])
          ids = ids.concat(getAllParentIds(item[childrenField], onlyFirstParentNode))
        }

        if (onlyFirstParentNode) break
      }

      return ids
    }

    /**
     * 按条件筛选包含关键字的所有项（包含层级关系）
     * @param dataSource {Array} 搜索源
     * @param searchValue {string} 搜索关键字
     * @returns {*[]}
     */
    function filter(dataSource, searchValue) {
      if (!Array.isArray(dataSource) || typeof searchValue !== 'string') return []
      if (searchValue === '') return []

      const copyOfDataSource = cloneDeep(dataSource)
      const temp = []
      const titleField = props.fieldNames.title
      const childrenField = props.fieldNames.children

      for (const item of copyOfDataSource) {
        if (item[titleField].includes(searchValue)) {
          temp.push(item)
        } else if (Array.isArray(item[childrenField]) && item[childrenField].length) {
          item[childrenField] = filter(item[childrenField], searchValue)

          if (item[childrenField].length) {
            temp.push(item)
          }
        }
      }

      return temp
    }

    /**
     * antd vue Tree 组件的 select 事件回调
     * @param selectedKeys {array} 当前选中的 keys
     * @param e {Object} 当前是否有被选中的结点
     */
    async function onSelect(selectedKeys, e) {
      if (Object.keys(router.currentRoute.value.query).length) {
        /**
         * #2 （一个书签，与本组件的 #1 配合）
         * 手动选择树节点后，清空地址栏的参数,
         * 改用 params 传递参数（params 参数在刷新页面后自动消失）
         */
        await router.push({
          query: {},
          params: {
            ...props.injectSearchParamsOfTable(e.node.dataRef), // 获取额外请求参数
            [treeIdField.value]: selectedKeys[0] // 获取树ID
          }
        })
      } else {
        let payload
        const _treeIdField = props.getFieldNameForTreeId(e.node.pos.split('-').length - 1)

        if (oldTreeIdField.value !== _treeIdField) {
          // 清空 search 内上一次树操作的键与值
          if (oldTreeIdField.value) {
            store.setSearchParams({
              ...props.injectSearchParamsOfTable({}),
              [oldTreeIdField.value]: undefined
            })
          }

          // 更新对应 store 模块内 treeIdField 字段的值
          store.treeIdField = _treeIdField
          oldTreeIdField.value = _treeIdField
        }

        if (e.selected) {
          payload = {
            ...props.injectSearchParamsOfTable(e.node.dataRef),
            [treeIdField.value]: selectedKeys[0]
          }
        } else {
          if (treeIdField.value) {
            payload = {
              ...props.injectSearchParamsOfTable(props.notNoneMode ? dataSource.value[0] : {}),
              [treeIdField.value]: props.notNoneMode ? dataSource.value[0]?.[props.fieldNames.key] : ''
            }
          }
        }

        if (treeIdField.value && payload[treeIdField.value] !== treeId.value[0]) {
          initSearchParameters({ searchParams: payload })
        }
      }
    }

    /**
     * 收缩/展开树所在侧边栏时的回调函数
     */
    function onSidebarSwitch() {
      // tableRef.value?.$parent?.resize()
    }

    /**
     * 搜索树
     * @param e
     */
    function onTreeSearch(e) {
      expandedKeysFormEvent.value = []
      searchValue.value = e.target.value
    }

    /**
     * 展开树
     * @param expandedKeys
     */
    function onExpand(expandedKeys, { expanded }) {
      isCollapsedManually.value = !expanded
      expandedKeysFormEvent.value = expandedKeys
    }

    async function initSearchParams() {
      while (!status.value) {
        await sleep(100)
      }

      if (status.value.status) {
        return Promise.resolve({
          ...props.injectSearchParamsOfTable(dataSource.value[0] ?? {}), // 获取额外请求参数
          [treeIdField.value]: dataSource.value[0]?.[props.fieldNames.key], // 获取树ID
          ...router.currentRoute.value.query, // 获取地址栏的值
          /* #1 （一个书签，与本组件 #2 书签配合） */
          ...router.currentRoute.value.params // 获取清空 query 后，通过 route.params 传递的参数。
        })
      } else {
        if (status.value.message !== 'canceled' && +status.value.code !== 30001) {
          return Promise.reject(new Error('未获取到树数据，已停止加载后续所有的依赖功能！'))
        }

        return Promise.resolve(status.value)
      }
    }

    onBeforeMount(async () => {
      // 请求树的数据
      status.value = await getTree()

      // 订阅指定的 actions。当本页面指定的 action 被触发后，更新树。
      // if (props.actionsForUpdateTree.length) {
      //   this.$store.subscribeAction({
      //     after: async action => {
      //       if (action.payload?.moduleName === moduleName && props.actionsForUpdateTree.includes(action.type)) {
      //         await this.getTree()
      //       }
      //     }
      //   })
      // }

      defaultExpandedTreeIds.value = [
        ...props.defaultExpandedKeys,
        router.currentRoute.value.query[props.getFieldNameForTreeId()],
        router.currentRoute.value.params[props.getFieldNameForTreeId()]
      ].filter(id => id !== undefined)

      const treeIdField = props.getFieldNameForTreeId(1)

      // 更新 store.state 里用于树ID的键名（主要适配每一级树所使用的键名不同的情况）
      store.setState('treeIdField', treeIdField)
      oldTreeIdField.value = treeIdField
    })

    // 非空模式下会在获取到树的数据后自动请求列表数据
    if (props.notNoneMode) {
      // 将初始化异步参数任务加入任务队列
      store.taskQueues.treeNode = [initSearchParams()]
    }

    return () => (
      <TGContainerWithSider
        class="tg-container-with-tree-sider"
        siderClass="tg-container-with-tree-sider--sider"
        contentClass={`tg-container-with-tree-sider--content${props.contentClass ? ` ${props.contentClass}` : ''}`}
        siderOnLeft
        onSidebarSwitch={onSidebarSwitch}
        showSiderTrigger={configs.siderTree.showTrigger}
      >
        {{
          default: slots.default,
          sider: () => (
            <div class="tg-search-tree-container">
              <Input
                prefix={<SearchOutlined />}
                allowClear
                placeholder={props.placeholder}
                onChange={debounce(onTreeSearch, 300)}
              />
              <Spin spinning={loading.value}>
                <Tree
                  showLine
                  showIcon
                  blockNode
                  selectedKeys={treeId.value}
                  onSelect={onSelect}
                  expandedKeys={expandedKeys.value}
                  onExpand={onExpand}
                  treeData={_dataSource.value.length ? _dataSource.value : dataSource.value}
                  fieldNames={props.fieldNames}
                >
                  {{
                    switcherIcon: () => <CaretDownOutlined style={{ fontSize: '0.8em' }} />,
                    title: ({ name }) => {
                      if (searchValue.value && name.indexOf(searchValue.value) > -1) {
                        return (
                          <span>
                            {name.substring(0, name.indexOf(searchValue.value))}
                            <span style={{ color: 'var(--tg-theme-color-primary)' }}>{searchValue.value}</span>
                            {name.substring(name.indexOf(searchValue.value) + searchValue.value.length)}
                          </span>
                        )
                      } else {
                        return name
                      }
                    }
                  }}
                </Tree>
              </Spin>
            </div>
          )
        }}
      </TGContainerWithSider>
    )
  }
}
