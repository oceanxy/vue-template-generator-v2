import './assets/styles/index.scss'
import useTGModal from '@/composables/tgModal'
import useTGForm from '@/composables/form'

export default function useTGFormModal({
  visibilityFieldName = 'visibilityOfEdit',
  rules,
  location,
  modalProps
}) {
  const form = useTGForm({ rules, location })
  const tgModal = useTGModal({
    visibilityFieldName,
    modalProps,
    location
  })

  return { ...tgModal, ...form }
}
