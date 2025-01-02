import './assets/styles/index.scss'
import { computed, provide, ref, watch } from 'vue'
import { Button, Modal, Spin } from 'ant-design-vue'
import useThemeVars from '@/composables/themeVars'
import useStore from '@/composables/tgStore'

/**
 *
 * @param location
 * @param modalStatusFieldName
 * @param form
 * @param [store] {import('pinia').defineStore} - 默认为当前页面的 store。
 * @param [confirmLoading] {import('@vue/reactivity').Ref<boolean>} - `okButton`的`loading`值。
 * @param unWatch
 * @returns {Object}
 */
export default function useTGModal({
  location,
  modalStatusFieldName = 'showModalForEditing',
  form,
  store,
  confirmLoading,
  unWatch
}) {
  const tgModal = ref(null)
  const style = ref('')
  const initialPosition = ref({ x: 0, y: 0 })
  const isDragging = ref(false)
  const currentOffset = ref({ x: 0, y: 0 })

  if (!store) {
    store = useStore()
  }

  const open = computed(() => store[modalStatusFieldName])
  const currentItem = computed(() => store.currentItem)
  const modalContentLoading = computed(() => store?.[location]?.loading ?? false)

  provide('inModal', true)

  watch(open, val => {
    if (!val) {
      if (typeof unWatch?.value === 'function') {
        unWatch.value()
      }

      form?.resetFields()
      form?.clearValidate()
      initialPosition.value = { x: 0, y: 0 }
      currentOffset.value = { x: 0, y: 0 }
      style.value = `translate(${currentOffset.value.x}px, ${currentOffset.value.y}px)`
    }
  })

  /**
   * 关闭弹窗
   * @param [callback] {()=>void} - 关闭弹窗后的回调。
   * @returns {Promise<void>}
   */
  async function handleCancel({ callback } = {}) {
    if (typeof callback === 'function') {
      callback()
    }

    store.setVisibilityOfModal({ modalStatusFieldName })
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
   * @config [readonly] {boolean} - 只读弹窗，为true时，弹窗按钮只显示为一个关闭按钮。
   * 若要更改按钮的文本请参照 ant-design-vue modal 组件的 API。
   * @param slots
   * @returns {JSX.Element}
   * @constructor
   */
  function TGModal(props, { slots }) {
    return (
      <Modal
        ref={tgModal}
        class={'tg-modal'}
        getContainer={() => document.querySelector('.tg-container-modals')}
        {...confirmLoading ? { confirmLoading: confirmLoading.value } : {}}
        onCancel={handleCancel}
        open={open.value}
        maskClosable={false}
        style={{ transform: style.value }}
        {...(props.readonly ? { footer: <Button onClick={handleCancel}>关闭</Button> } : {})}
        {...props.modalProps}
        title={
          <div
            style={{ cursor: 'move', userSelect: 'none' }}
            onMousedown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
          >
            {props.modalProps?.title?.replace('{ACTION}', currentItem.value?.id ? '编辑' : '新增')}
          </div>
        }
      >
        <Spin spinning={modalContentLoading.value}>
          {slots.default?.()}
        </Spin>
      </Modal>
    )
  }

  return {
    TGModal,
    open,
    currentItem,
    modalContentLoading,
    handleCancel
  }
}
