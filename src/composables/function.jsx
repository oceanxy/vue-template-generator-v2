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
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons-vue'

/**
 * 基本按钮枚举
 * @global
 * @readonly
 * @enum {'ADD'|'EDIT'|'DELETE'}
 */
export const controlBarBaseButtons = {
  ADD: 'ADD',
  EDIT: 'EDIT',
  DELETE: 'DELETE'
}

/**
 * @param [align] {'left'|'center'|'right'} - 按钮对齐方式，默认为 'right'。支持 'left','center','right'。
 * @param [isOverrideDefaultButtons] {boolean} - 是否覆盖默认按钮，默认为 false。
 * @param {(selectedRows:Object[]) => ({[fieldName]: boolean})} [controlButtonPermissions] - 用于控制按钮禁用权限的回调函数，
 *  仅当selectedRows发生改变时调用。
 *  接收一个参数 selectedRows。当前选中行数组。
 *  返回一个对象，对象的键（fieldName）为控制禁用权限的字段名（如： 'editButtonDisabled'），对象的值为布尔值。
 *  默认不传，相当于至少勾选了一行列表即解除禁用。
 * @param {controlBarBaseButtons[]} [baseOperationButtons] - 默认按钮，
 * 默认为 ['ADD', 'DELETE', 'EDIT']，即默认显示新增、删除、修改按钮。
 * @returns {{store: *}}
 */
export default function useFunction({
  align,
  isOverrideDefaultButtons,
  controlButtonPermissions,
  baseOperationButtons = [controlBarBaseButtons.ADD, controlBarBaseButtons.EDIT, controlBarBaseButtons.DELETE]
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
   * 新增
   * @param [initialValue] {Object} 初始化默认值
   * @returns {Promise<void>}
   */
  async function onAdd(initialValue = {}) {
    await store.setVisibilityOfModal({ ...initialValue })
  }

  /**
   * 编辑
   * @returns {Promise<void>}
   */
  async function onEdit() {
    await store.setVisibilityOfModal({ ...this.editedRow, _isBulkOperations: true })
  }

  /**
   * 删除
   * @param [done] {() => void} 成功执行删除的回调
   * @returns {Promise<void>}
   */
  async function onDelete(done) {
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
   * @param [isTimeName] {boolean} 默认false，开启之后filename后添加时间格式命名。
   * @returns {Promise<void>}
   */
  async function onExport(fileName, payload, apiName, isTimeName = false) {
    message.loading({
      content: '正在导出，请稍候...',
      duration: 0
    })

    // 获取当前日期
    const date = dayjs(new Date()).format('YYYYMMDDHHmmss')

    exportButtonDisabled.value = true

    await store.exportData({
      params: { ...router.currentRoute.value.query, ...payload },
      apiName,
      fileName: `${fileName || this.$route.meta.title}${isTimeName ? date : ''}`
    })

    exportButtonDisabled.value = false
    message.destroy()
  }

  /**
   * 批量操作之前的询问，并验证是否勾选了表格数据
   * @param visibilityFieldName {string}
   * @param [params] {Object}
   */
  async function onBulkOperation(visibilityFieldName, params) {
    await verifySelected(this.selectedRowKeys, () => {
      store.setVisibilityOfModal(
        {
          ids: this.selectedRowKeys,
          ...params
        },
        visibilityFieldName
      )
    })
  }

  /**
   * 审核或相关意见填写的批量操作
   * @param [visibilityFieldName] {string} 弹窗控制字段 默认 visibilityOfEdit
   * @returns {Promise<void>}
   */
  async function onAudit(visibilityFieldName) {
    await store.setVisibilityOfModal({ ids: this.ids }, visibilityFieldName)
  }

  /**
   *
   * @param functionContent {JSX.Element}
   * @returns {JSX.Element}
   */
  function render(functionContent) {
    return (
      <Space class={`tg-function${align ? ` ${align}` : ''}`}>
        {
          !isOverrideDefaultButtons
            ? [
              baseOperationButtons.includes(controlBarBaseButtons.ADD)
                ? (
                  <TGPermissionsButton
                    type="primary"
                    identification={'ADD'}
                    onClick={() => onAdd()}
                    icon={<PlusOutlined />}
                  >
                    新增
                  </TGPermissionsButton>
                )
                : null,
              baseOperationButtons.includes(controlBarBaseButtons.DELETE)
                ? (
                  <TGPermissionsButton
                    danger
                    identification={'DELETE'}
                    disabled={deleteButtonDisabled.value}
                    onClick={() => onDelete()}
                    icon={<DeleteOutlined />}
                  >
                    删除
                  </TGPermissionsButton>
                )
                : null,
              baseOperationButtons.includes(controlBarBaseButtons.EDIT)
                ? (
                  <TGPermissionsButton
                    identification={'UPDATE'}
                    disabled={editButtonDisabled.value}
                    onClick={() => onEdit()}
                    icon={<EditOutlined />}
                  >
                    修改
                  </TGPermissionsButton>
                )
                : null
            ]
            : null
        }
        {functionContent}
      </Space>
    )
  }

  return {
    baseOperationButtons,
    controlBarBaseButtons,
    editButtonDisabled: buttonDisabled.value ? buttonDisabled : editButtonDisabled,
    deleteButtonDisabled: buttonDisabled.value ? buttonDisabled : deleteButtonDisabled,
    auditButtonDisabled: buttonDisabled.value ? buttonDisabled : auditButtonDisabled,
    exportButtonDisabled: buttonDisabled.value ? buttonDisabled : exportButtonDisabled,
    editedRow,
    ids,
    store,
    render
  }
}
