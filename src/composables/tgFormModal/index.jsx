import './assets/styles/index.scss'
import useTGModal from '@/composables/tgModal'
import useTGForm from '@/composables/tgForm'
import { nextTick, provide, reactive, ref, watch } from 'vue'
import { set } from 'lodash/object'

/**
 *
 * @param modalProps
 * @param [modalStatusFieldName] {string}
 * @param [location] {string}
 * @param [rules] {Object} - 表单验证规则
 * @param [isGetDetails] {boolean} - 是否在打开编辑弹窗时获取详情数据。
 * @param [searchParamOptions] {SearchParamOption[]} - 搜索参数配置。
 * @returns {Object}
 */
export default function useTGFormModal({
  modalProps,
  modalStatusFieldName = 'showModalForEditing',
  location,
  rules,
  isGetDetails,
  searchParamOptions
}) {
  provide('inModal', true)

  let unWatch = ref(undefined)

  const { TGForm, ...tgForm } = useTGForm({
    location,
    rules,
    searchParamOptions,
    isGetDetails,
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
  watch(tgModal.currentItem, async val => {
    if (location && Object.keys(val).length) {
      for (const key in tgForm.formModel) {
        if (key in val) {
          tgForm.formModel[key] = val[key]
        }
      }

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
   * @param _params
   */
  function handleFinish(_params) {
    const { params, ...rest } = _params
    let paramsInjectId

    if (typeof params === 'function') {
      paramsInjectId = params() || {}
    } else {
      paramsInjectId = params || {}
    }

    if ('id' in tgModal.currentItem.value && !paramsInjectId.id) {
      paramsInjectId.id = tgModal.currentItem.value.id
    }

    tgForm.handleFinish({
      params: paramsInjectId,
      ...rest,
      isMergeParam: true
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
      <TGModal class={'tg-form-modal'} modalProps={_modalProps}>
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
