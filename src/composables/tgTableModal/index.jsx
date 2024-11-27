import useTGModal from '@/composables/tgModal'

export default function useTGTableModal({
  modalStatusFieldName = 'showModalForEditing',
  modalProps
}) {
  return useTGModal({
    modalStatusFieldName,
    modalProps
  })
}
