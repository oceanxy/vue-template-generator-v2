import './assets/styles/index.scss'
import useTGModal from '@/composables/tgModal'
import useTGForm from '@/composables/tgForm'
import { nextTick, provide, reactive, watch } from 'vue'
import { set } from 'lodash/object'

/**
 *
 * @param [modalStatusFieldName] {string}
 * @param [location] {string}
 * @param [rules] {Object} - 表单验证规则
 * @param [isGetDetails] {boolean} - 是否在打开编辑弹窗时获取详情数据。
 * @param [searchParamOptions] {SearchParamOption[]} - 搜索参数配置。
 * @returns {Object}
 */
export default function useTGFormModal({
  modalStatusFieldName = 'showModalForEditing',
  location,
  rules,
  isGetDetails,
  searchParamOptions,
  modalProps
}) {
  provide('inModal', true)

  const { TGForm, ...tgForm } = useTGForm({
    location,
    rules,
    searchParamOptions,
    modalStatusFieldName,
    loaded
  })

  const { TGModal, ...tgModal } = useTGModal({
    location,
    modalStatusFieldName,
    store: tgForm.store,
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

  watch(tgModal.open, async val => {
    if (val && isGetDetails && 'id' in tgModal.currentItem.value) {
      await tgForm.store.getDetails({
        location,
        setValue(data, store) {
          store.currentItem.functionInfoList = data
        }
      })
    }
  })

  const _modalProps = reactive(modalProps)

  // 设置 okButtonProps 的默认禁用状态为true
  set(_modalProps, 'okButtonProps.disabled', true)

  /**
   * 当所有弹窗内的数据加载完成后，解除 Modal 组件提交按钮的禁用状态
   * @param formModel {Object} - Form组件内字段的值
   */
  function loaded(formModel) {
    watch(formModel, () => {
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

  return { TGFormModal, ...tgModal, ...tgForm }
}
