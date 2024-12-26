/**
 * 页面功能
 * @Author: Omsber
 * @Email: xyzsyx@163.com
 * @Date: 2024-10-18 周五 16:54:48
 */

import useStore from '@/composables/tgStore'
import { computed, inject, ref, watch } from 'vue'
import { verificationDialog, verifySelected } from '@/utils/message'
import { message, Space } from 'ant-design-vue'
import dayjs from 'dayjs'
import router from '@/router'
import TGPermissionsButton from '@/components/TGPermissionsButton'
import { DeleteOutlined, EditOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons-vue'

/**
 * 基本按钮枚举
 * @global
 * @readonly
 * @enum {'ADD' | 'EDIT' | 'DELETE' | 'EXPORT'}
 */
export const FunctionButtonEnum = {
  ADD: 'ADD',
  EDIT: 'EDIT',
  DELETE: 'DELETE',
  EXPORT: 'EXPORT'
}

/**
 * @param [controlButtonPermissions] {(selectedRows:Object[]) => ({[fieldName]: boolean})} - 用于控制按钮禁用权限的回调函数，
 *  仅当selectedRows发生改变时调用。
 *  接收一个参数 selectedRows。当前选中行数组。
 *  返回一个对象，对象的键（fieldName）为控制禁用权限的字段名（如： 'editButtonDisabled'），对象的值为布尔值。
 *  默认不传，相当于至少勾选了一行列表即解除禁用。
 * @param [setAddParams] {() => Object} - 设置 handleAdd 函数的参数。
 * @param [setExportParams] {() => Object} - 设置 handleExport 函数的参数。
 * @returns {{store: *}}
 */
export default function useFunction({
  controlButtonPermissions,
  setAddParams,
  setExportParams
} = {}) {
  /**
   * 判断本页面是否存在侧边树组件
   * 来自于 @/src/components/TGContainerWithTreeSider 组件
   */
  const hasTree = inject('hasTree', false)
  /**
   * 刷新侧边树的数据
   * 来自于 @/src/components/TGContainerWithTreeSider 组件
   */
  const refreshTree = inject('refreshTree', undefined)

  const store = useStore()

  const editButtonDisabled = ref(true)
  const deleteButtonDisabled = ref(true)
  const auditButtonDisabled = ref(true)
  const exportButtonDisabled = ref(false)
  const editedRow = ref({})
  const ids = ref('')

  const selectedRowKeys = computed(() => store.selectedRowKeys)
  const selectedRows = computed(() => store.selectedRows)
  const buttonDisabled = computed(() => store.dataSource?.loading)

  watch(selectedRows, value => {
    editButtonDisabled.value = value.length !== 1
    deleteButtonDisabled.value = !value.length
    auditButtonDisabled.value = !value.length

    if (typeof controlButtonPermissions === 'function') {
      Object.entries(controlButtonPermissions(value)).forEach(([key, value]) => {
        this[key] = value
      })
    }

    if (value.length === 1) {
      editedRow.value = value[0]
    } else {
      editedRow.value = {}
    }

    ids.value = value.map(item => item.id).join()
  })

  /**
   * 处理打开弹窗的前置点击事件
   * @param currentItem {Object}
   * @param modalStatusFieldName {string}
   * @param location
   * @param injectSearchParams
   * @param merge
   * @returns {Promise<void>}
   */
  function handleClick({
    currentItem,
    modalStatusFieldName,
    location,
    injectSearchParams,
    merge
  } = {}) {
    store.setVisibilityOfModal({
      currentItem,
      modalStatusFieldName,
      location,
      injectSearchParams,
      merge
    })
  }

  /**
   * 新增
   * @param [currentItem={}] {Object} - 当前数据
   * @param [injectSearchParams] {Array<string, (search)=>Object>} - 打开弹窗时，
   * 需要从`store.search`传递到`store[location].form`的参数名。
   * @returns {Promise<void>}
   */
  async function handleAdd({ currentItem = {}, injectSearchParams } = {}) {
    if (typeof setAddParams === 'function') {
      const params = setAddParams()

      currentItem = params.currentItem || currentItem
      injectSearchParams = params.injectSearchParams || injectSearchParams
    }

    await store.setVisibilityOfModal({
      currentItem,
      injectSearchParams
    })
  }

  /**
   * 编辑
   * @returns {Promise<void>}
   */
  async function handleEdit() {
    await store.setVisibilityOfModal({
      currentItem: { ...editedRow.value }
    })
  }

  /**
   * 删除
   * @param [done] {() => void} 成功执行删除的回调
   * @returns {Promise<void>}
   */
  async function handleDelete(done) {
    await verificationDialog(
      async () => {
        const status = await store.delete()

        if (status && hasTree) {
          await refreshTree?.()
        }

        if (status && typeof done === 'function') {
          done()
        }

        return Promise.resolve(status)
      },
      () => (
        <div>
          <div>确定要批量删除已选中的数据吗？</div>
          <div style={{ color: '#b9b9b9' }}>
            当前已勾选的序号为：
            {
              selectedRows.value
                .map(item => item._sn)
                .sort((a, b) => a - b)
                .join('，')
            }
          </div>
        </div>
      )
    )
  }

  /**
   * 导出功能
   * @param [fileName] {string} 导出文件名 默认为本页面的 title。
   * @param [payload] {Object} 自定义导出参数，会联合该模块的 store.state.search 一起传递给接口。
   * @param [apiName] {string} 自定义导出接口名，默认为`export${MODULE_NAME}`。
   * @param [isTimeName] {boolean} 默认false，开启之后在`filename`后添加时间格式命名。
   * @returns {Promise<void>}
   */
  async function handleExport(fileName, payload, apiName, isTimeName = false) {
    message.loading({
      content: '正在导出，请稍候...',
      duration: 0
    })

    if (typeof setExportParams === 'function') {
      const params = setExportParams()

      fileName = params.fileName || fileName
      payload = params.payload || payload
      apiName = params.apiName || apiName
      isTimeName = params.isTimeName || isTimeName
    }

    // 获取当前日期
    const getDateTime = () => `[${dayjs(new Date()).format('YYYYMMDDHHmmss')}]`

    exportButtonDisabled.value = true

    await store.exportData({
      params: { ...router.currentRoute.value.query, ...payload },
      apiName,
      fileName: `${fileName && isTimeName ? getDateTime() : ''}${fileName}`
    })

    exportButtonDisabled.value = false
    message.destroy()
  }

  /**
   * 批量操作之前的询问，并验证是否勾选了表格数据
   * @param modalStatusFieldName {string}
   * @param [params] {Object}
   */
  async function handleBulkOperation(modalStatusFieldName, params) {
    await verifySelected(this.selectedRowKeys, () => {
      store.setVisibilityOfModal(
        {
          ids: this.selectedRowKeys,
          ...params
        },
        modalStatusFieldName
      )
    })
  }

  /**
   * @param props
   * @config [align] {'left'|'center'|'right'} - 按钮对齐方式，默认为 'right'。支持 'left','center','right'。
   * @config {FunctionButtonEnum[]} [functionButtons] - 默认按钮，默认为`[]`，即默认不显示内置按钮。
   * @param slots
   * @returns {JSX.Element}
   * @constructor
   */
  function TGFunction(props, { slots }) {
    const { align = 'right', functionButtons = [] } = props

    return (
      <Space class={`tg-function${align ? ` ${align}` : ''}`}>
        {[
          functionButtons?.includes(FunctionButtonEnum.ADD) && (
            <TGPermissionsButton
              type="primary"
              identification={'ADD'}
              disabled={buttonDisabled.value}
              onClick={() => handleAdd()}
              icon={<PlusOutlined />}
            >
              新增
            </TGPermissionsButton>
          ),
          functionButtons?.includes(FunctionButtonEnum.DELETE) && (
            <TGPermissionsButton
              danger
              identification={'DELETE'}
              disabled={deleteButtonDisabled.value}
              onClick={() => handleDelete()}
              icon={<DeleteOutlined />}
            >
              删除
            </TGPermissionsButton>
          ),
          functionButtons?.includes(FunctionButtonEnum.EDIT) && (
            <TGPermissionsButton
              identification={'UPDATE'}
              disabled={editButtonDisabled.value}
              onClick={() => handleEdit()}
              icon={<EditOutlined />}
            >
              修改
            </TGPermissionsButton>
          ),
          functionButtons?.includes(FunctionButtonEnum.EXPORT) && (
            <TGPermissionsButton
              identification={'EXPORT'}
              disabled={exportButtonDisabled.value}
              onClick={() => handleExport()}
              icon={<ExportOutlined />}
            >
              导出
            </TGPermissionsButton>
          )
        ]}
        {slots.default && slots.default()}
      </Space>
    )
  }

  return {
    FunctionButtonEnum,
    buttonDisabled,
    editButtonDisabled: computed(() => buttonDisabled.value || editButtonDisabled.value),
    deleteButtonDisabled: computed(() => buttonDisabled.value || deleteButtonDisabled.value),
    auditButtonDisabled: computed(() => buttonDisabled.value || auditButtonDisabled.value),
    exportButtonDisabled: computed(() => buttonDisabled.value || exportButtonDisabled.value),
    editedRow,
    ids,
    store,
    TGFunction,
    handleAdd,
    handleClick,
    handleExport
  }
}
