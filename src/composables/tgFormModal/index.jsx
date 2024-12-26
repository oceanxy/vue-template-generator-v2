import './assets/styles/index.scss'
import useTGModal from '@/composables/tgModal'
import useTGForm from '@/composables/tgForm'
import { nextTick, provide, reactive, ref, toRaw, watch } from 'vue'
import { set } from 'lodash/object'

/**
 *
 * @param modalProps
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

  let unWatch = ref(undefined)

  const { TGForm, ...tgForm } = useTGForm({
    location,
    rules,
    searchParamOptions,
    isGetDetails,
    apiName,
    getParams,
    setDetails,
    modalStatusFieldName,
    loaded
  })

  const { TGModal, ...tgModal } = useTGModal({
    location,
    modalStatusFieldName,
    store: tgForm.store,
    confirmLoading: tgForm.confirmLoading,
    unWatch,
    form: {
      clearValidate: tgForm.clearValidate,
      resetFields: tgForm.resetFields
    }
  })

  // 将`store.currentItem`和`store[location].form`中的同名字段保持同步
  watch(tgModal.currentItem, async currentItem => {
    if (location) {
      const formModel = {}

      if (Object.keys(currentItem).length) {
        for (const key in tgForm.formModel) {
          if (key in currentItem) {
            const formModelKey = tgForm.formModel[key]
            const currentItemKey = toRaw(currentItem[key])

            // 引用类型为假值时跳过
            if (!currentItemKey && typeof formModelKey === 'object') {
              continue
            }

            formModel[key] = currentItem[key]
          }
        }
      }

      tgForm.store.$patch({
        [location]: {
          form: {
            ...formModel,
            ...formModelFormatter?.(currentItem)
          }
        }
      })

      await nextTick()

      tgForm.clearValidate()
    }
  }, { deep: true })

  const _modalProps = reactive(modalProps)

  // 设置 okButtonProps 的默认禁用状态为true
  set(_modalProps, 'okButtonProps.disabled', true)

  watch(tgModal.open, async val => {
    if (!val) {
      set(_modalProps, 'okButtonProps.disabled', true)
    }
  })

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
  function handleFinish({
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

    if (!apiName && ('id' in tgModal.currentItem.value) && !paramsInjectId.id) {
      paramsInjectId.id = tgModal.currentItem.value.id
    }

    tgForm.handleFinish({
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
   * 当所有弹窗内的数据加载完成后，解除 Modal 组件提交按钮的禁用状态
   * @param formModel {Object} - Form组件内字段的值
   */
  function loaded(formModel) {
    unWatch.value = watch(formModel, () => {
      set(_modalProps, 'okButtonProps.disabled', false)
    }, { deep: true })
  }

  function TGFormModal(props, { slots }) {
    return (
      <TGModal
        class={'tg-form-modal'}
        modalProps={_modalProps}
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
