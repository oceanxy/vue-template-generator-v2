import './assets/styles/index.scss'
import useTGModal from '@/composables/tgModal'
import useTGForm from '@/composables/tgForm'
import { provide, reactive, watch } from 'vue'
import { set } from 'lodash/object'

/**
 * TGFormModal
 * @param [storeName] {string} - store名称，默认为当前页面的store模块。
 * @param modalProps {import('ant-design-vue').ModalProps}
 * @param [modalStatusFieldName='showModalForEditing'] {string} - 弹窗状态字段名，
 * 用于操作完成后关闭指定弹窗，默认值为'showModalForEditing'。
 * @param [location='modalForEditing'] {string}
 * @param [rules] {Object} - 表单验证规则
 * @param [isGetDetails] {boolean} - 是否在打开编辑弹窗时获取详情数据。
 * @param [apiName] {string} - 自定义获取详情的接口名称，依赖`isGetDetails`，默认为`getDetailsOf{route.name}`。
 * @param [getParams] {((currentItem:Object) => Object) | Object} - 自定义获取详情的参数，默认为`store.state.currentItem.id`。
 * @param [setDetails] {(data: any, store: import('pinia').defineStore) => void} - 获取到详细
 * 数据后的自定义数据处理逻辑，不为函数时默认与`store.state.currentItem`合并。
 * @param [searchParamOptions] {SearchParamOption[]} - 搜索参数配置。
 * @param [formModelFormatter] {(currentItem: Object) => Object} - 初始化表单数据函数，
 * 参数为`currentItem`，返回值为处理后的表单数据，只需返回需要处理的字段即可。比如将接口中获取的省、市、区三个字段处理成
 * 一个数组，以供 Cascader 组件绑定使用。
 * @returns {Object}
 */
export default function useTGFormModal({
  storeName,
  modalProps,
  modalStatusFieldName = 'showModalForEditing',
  location = 'modalForEditing',
  rules,
  isGetDetails,
  apiName,
  getParams,
  setDetails,
  searchParamOptions,
  formModelFormatter
}) {
  provide('inModal', true)

  const _modalProps = reactive(modalProps)
  // FormModel 组件默认禁用提交按钮
  set(_modalProps, 'okButtonProps.disabled', true)

  const { TGForm, ...tgForm } = useTGForm({
    storeName,
    location,
    modalStatusFieldName,
    rules,
    searchParamOptions,
    isGetDetails,
    apiName,
    getParams,
    setDetails,
    formModelFormatter,
    loaded
  })

  const { TGModal, ...tgModal } = useTGModal({
    location,
    modalStatusFieldName,
    modalProps: _modalProps,
    store: tgForm.store
  })

  watch(tgModal.open, val => {
    // 当弹窗显示状态发生改变时，重置弹窗的提交按钮的禁用状态
    set(_modalProps, 'okButtonProps.disabled', true)
  })

  /**
   * 当所有弹窗内的枚举和详情数据加载完成后（formModel初始化完成后），开始监听 formModel，
   * 以在数据有更改时，解除 Modal 组件提交按钮的禁用状态。
   * @param formModel {Object} - Form组件内字段的值
   */
  function loaded(formModel) {
    const unWatch = watch(formModel, () => {
      set(_modalProps, 'okButtonProps.disabled', false)
      unWatch()
    }, { deep: true })
  }

  /**
   * 为`TGFormModal`组件自动注入唯一标识符（id）参数
   * @param [callback] {()=>void} - 自定义验证成功后执行的回调函数，该参数与本函数的其他所有参数互斥。
   * @param [apiName] {string} - 自定义接口名称，传递此值时，action将失效。
   * @param [action] {'update','add',string} - 操作类型，未定义 apiName 时生效。
   * 默认根据`store.state.currentItem`中的`id`字段自动判断是 'update' 还是 'add'，其他情况则需要自行传递。
   * 主要用于生成接口地址，生成规则`{ACTION}{router.currentRoute.value.name}`。
   * @param [params] {(() => Object) | Object} - 传递给接口的表单值，受`isMergeParam`参数影响。
   * @param [isMergeParam=true] {boolean} - 是否将 params 参数与`store.state[location].form`合并，默认为 true。
   * 合并操作不会改变`store.state[location].form`的值，合并后的值仅传递给接口使用，合并时此参数的优先级更高。
   * 不合并时仅将 params 传递给接口。
   * @param [isRefreshTable=true] {boolean} - 是否刷新表格数据，默认 true。
   * @param [isRefreshTree] {boolean} - 是否在成功提交表单后刷新对应的侧边树，默认 false。
   * 依赖`inject(hasTree)`和`inject(refreshTree)`。
   * @param [success] {()=>void} - 操作执行成功后的回调函数。
   */
  async function handleFinish({
    callback,
    apiName,
    action,
    params,
    isMergeParam = true,
    isRefreshTable = true,
    isRefreshTree,
    success
  } = {}) {
    let paramsInjectId

    if (typeof params === 'function') {
      paramsInjectId = params() || {}
    } else {
      paramsInjectId = params || {}
    }

    if (
      !apiName
      && (tgForm.store.rowKey in (tgModal.currentItem.value || {}))
      && !paramsInjectId[tgForm.store.rowKey]
    ) {
      paramsInjectId.id = tgModal.currentItem.value[tgForm.store.rowKey]
    }

    return await tgForm.handleFinish({
      params: paramsInjectId,
      callback,
      apiName,
      action,
      isMergeParam,
      isRefreshTable,
      isRefreshTree,
      modalStatusFieldName,
      success
    })
  }

  /**
   *
   * @param props {{labelWidth: number|string}}
   * @param slots
   * @returns {JSX.Element}
   * @constructor
   */
  function TGFormModal(props, { slots }) {
    return (
      <TGModal
        class={'tg-form-modal'}
        style={{ '--label-width': props.labelWidth || '80px' }}
        readonly={props.readonly}
      >
        <TGForm>
          {slots.default?.()}
        </TGForm>
      </TGModal>
    )
  }

  return {
    TGFormModal,
    ...tgModal,
    ...tgForm,
    handleFinish
  }
}
