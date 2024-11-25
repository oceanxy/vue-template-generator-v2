import useTGModal from '@/composables/tgModal'
import { Button } from 'ant-design-vue'

export default function useTGTableModal({
  visibilityFieldName = 'visibilityOfEdit',
  modalProps
}) {
  const tgModal = useTGModal({
    visibilityFieldName,
    modalProps
  })
  const footer = <Button onClick={tgModal.onCancel}>关闭</Button>

  return { ...tgModal, footer }
}
