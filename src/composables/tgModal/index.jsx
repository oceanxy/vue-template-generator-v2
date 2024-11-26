import './assets/styles/index.scss'
import { computed, provide, reactive, ref, watch } from 'vue'
import useStore from '@/composables/tgStore'
import useModuleName from '@/composables/moduleName'
import { Button, Modal, Spin } from 'ant-design-vue'
import useThemeVars from '@/composables/themeVars'

export default function useTGModal({
  location,
  visibilityFieldName = 'visibilityOfEdit',
  form
}) {
  const { cssVars } = useThemeVars()
  const moduleName = useModuleName()
  const store = useStore()

  const tgModal = ref(null)
  const style = ref('')
  const initialPosition = ref({ x: 0, y: 0 })
  const isDragging = ref(false)
  const currentOffset = ref({ x: 0, y: 0 })

  const okButtonProps = reactive({
    props: {
      disabled: false
    }
  })

  const open = computed(() => store[visibilityFieldName])
  const currentItem = computed(() => store.currentItem)
  const modalContentLoading = computed(() => store?.[location]?.loading ?? false)
  const confirmLoading = computed(() => store?.[location]?.confirmLoading ?? false)

  provide('inModal', true)

  watch(open, val => {
    if (!val) {
      form.resetFields()
      form.clearValidate()
    }
  })

  /**
   * 关闭弹窗
   * @param callback
   * @returns {Promise<void>}
   */
  async function onCancel({ callback }) {
    if ('disabled' in (okButtonProps?.props || {})) {
      okButtonProps.props.disabled = true
    }

    if (typeof callback === 'function') {
      callback()
    }

    store.setVisibilityOfModal({ visibilityFieldName })
  }

  function handleMouseDown(event) {
    isDragging.value = true
    initialPosition.value = { x: event.clientX, y: event.clientY }
  }

  function handleMouseMove(event) {
    if (!isDragging.value) return

    const deltaX = event.clientX - initialPosition.value.x
    const deltaY = event.clientY - initialPosition.value.y

    currentOffset.value = { x: currentOffset.value.x + deltaX, y: currentOffset.value.y + deltaY }
    initialPosition.value = { x: event.clientX, y: event.clientY }

    style.value = `translate(${currentOffset.value.x}px, ${currentOffset.value.y}px)`
  }

  function handleMouseUp() {
    isDragging.value = false
  }

  /**
   * modal 组件
   * @param props
   * @config modalPorps {import('ant-design-vue').ModalProps}
   * @config [readonly] {boolean} - 只显示取消按钮。
   * 若要更改按钮的文本请参照 ant-design-vue modal 组件的 API。
   * @param slots
   * @returns {JSX.Element}
   * @constructor
   */
  function TGModal(props, { slots }) {
    return (
      <Modal
        ref={tgModal}
        confirmLoading={confirmLoading.value}
        {...(props.readonly ? { footer: <Button onClick={onCancel}>关闭</Button> } : {})}
        {...props.modalProps}
        class={'tg-modal'}
        title={
          <div
            style={{ cursor: 'move', userSelect: 'none' }}
            onMousedown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
          >
            {props.modalProps.title}
          </div>
        }
        style={{
          '--tg-theme-color-primary-bg': cssVars.value['--tg-theme-color-primary-bg'],
          '--tg-theme-font-size-lg': cssVars.value['--tg-theme-font-size-lg'],
          '--tg-theme-color-text': cssVars.value['--tg-theme-color-text'],
          '--tg-theme-color-text-tertiary': cssVars.value['--tg-theme-color-text-tertiary'],
          transform: style.value
        }}
        open={open.value}
        onCancel={onCancel}
      >
        <Spin spinning={modalContentLoading.value}>
          {slots.default?.()}
        </Spin>
      </Modal>
    )
  }

  return {
    TGModal,
    moduleName,
    store,
    open,
    currentItem,
    onCancel
  }
}
