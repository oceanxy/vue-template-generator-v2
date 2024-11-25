import './assets/styles/index.scss'
import { computed, provide, reactive, ref } from 'vue'
import useStore from '@/composables/tgStore'
import useModuleName from '@/composables/moduleName'
import { Modal, Spin } from 'ant-design-vue'
import useThemeVars from '@/composables/themeVars'

export default function useTGModal({
  modalProps,
  location,
  visibilityFieldName = 'visibilityOfEdit'
}) {
  const { cssVars } = useThemeVars()
  const tgModal = ref(null)
  const style = ref('')
  const initialPosition = ref({ x: 0, y: 0 })
  const isDragging = ref(false)
  const currentOffset = ref({ x: 0, y: 0 })
  const moduleName = useModuleName()
  const store = useStore()

  const open = computed(() => store[visibilityFieldName])
  const currentItem = computed(() => store.currentItem)
  const confirmLoading = ref(false)
  const modalContentLoading = computed(() => store?.[location]?.loading ?? false)
  const okButtonProps = reactive({
    props: {
      disabled: false
    }
  })

  provide('inModal', true)

  /**
   * 关闭弹窗
   * @param callback
   * @returns {Promise<void>}
   */
  async function onCancel({
    callback
  }) {
    if ('disabled' in (okButtonProps?.props || {})) {
      okButtonProps.props.disabled = true
    }

    if (typeof callback === 'function') {
      callback()
    }

    store.setVisibilityOfModal({ visibilityFieldName })
  }

  /**
   * 为弹窗的按钮增加loading状态
   * @param callback {() => Promise<any>} - 点击弹窗要执行的逻辑
   * @returns {Promise<void>}
   */
  async function onConfirmLoading(callback) {
    confirmLoading.value = true

    await callback?.()

    confirmLoading.value = false
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

  function TGModal(props, { slots }) {
    return (
      <Modal
        ref={tgModal}
        {...modalProps?.value}
        class={'tg-modal'}
        title={
          <div
            style={{ cursor: 'move', userSelect: 'none' }}
            onMousedown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
          >
            {modalProps.value.title}
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
    onCancel,
    confirmLoading,
    onConfirmLoading
  }
}
