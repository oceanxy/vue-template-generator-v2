import useTGModal from '@/composables/tgModal'

export default function useTGTableModal({
  visibilityFieldName = 'visibilityOfEdit',
  modalProps
}) {
  return useTGModal({
    visibilityFieldName,
    modalProps
  })
}
