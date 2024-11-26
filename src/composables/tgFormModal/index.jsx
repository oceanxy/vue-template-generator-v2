import './assets/styles/index.scss'
import useTGModal from '@/composables/tgModal'
import useTGForm from '@/composables/form'

export default function useTGFormModal({
  visibilityFieldName = 'visibilityOfEdit',
  location,
  rules,
  modalProps
}) {
  const tgForm = useTGForm({
    location,
    rules
  })

  const tgModal = useTGModal({
    location,
    visibilityFieldName,
    modalProps,
    form: {
      clearValidate: tgForm.clearValidate,
      resetFields: tgForm.resetFields
    }
  })

  return { ...tgModal, ...tgForm }
}
