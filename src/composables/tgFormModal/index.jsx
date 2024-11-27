import './assets/styles/index.scss'
import useTGModal from '@/composables/tgModal'
import useTGForm from '@/composables/tgForm'
import { nextTick, watch, watchEffect } from 'vue'

/**
 *
 * @param [modalStatusFieldName] {string}
 * @param [location] {string}
 * @param [rules] {Object} - 表单验证规则
 * @param [isGetDetails] {boolean} - 是否在打开编辑弹窗时获取详情数据
 * @returns {Object}
 */
export default function useTGFormModal({
  modalStatusFieldName = 'showModalForEditing',
  location,
  rules,
  isGetDetails
}) {
  const { TGForm, ...tgForm } = useTGForm({
    location,
    rules
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

  // 将`store.currentItem`和`store[location].search`中的同名字段保持同步
  watch(tgModal.currentItem, async val => {
    if (location && Object.keys(val).length) {
      for (const key in tgForm.search.value) {
        tgForm.formModel[key] = val[key]
      }

      await nextTick()

      tgForm.clearValidate()
    }
  }, { deep: true })

  watchEffect(async () => {
    if (isGetDetails && tgModal.open && 'id' in tgModal.currentItem.value) {
      await tgForm.store.getDetails({
        location,
        setValue(data, store) {
          store.currentItem.functionInfoList = data
        }
      })
    }
  })

  function TGFormModal(props, { slots }) {
    return (
      <TGModal modalProps={props.modalProps}>
        <TGForm class={'tg-form-grid'}>
          {slots.default?.()}
        </TGForm>
      </TGModal>
    )
  }

  return { TGFormModal, ...tgModal, ...tgForm }
}
