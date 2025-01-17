import './assets/styles/index.scss'
import { computed, provide, reactive, ref, watch } from 'vue'
import { Button, Modal, Spin } from 'ant-design-vue'
import useStore from '@/composables/tgStore'

/**
 * TGModal 组件
 * @param [location='modalForEditing'] {string} - 弹窗位置，默认为 'modal'。
 * @param [modalStatusFieldName='showModalForEditing'] {string}
 * @param [modalProps] {import('ant-design-vue').ModalProps} - 弹窗的属性。
 * @param [form] {Object} - useForm API 返回的方法，主要用于在弹窗内操作表单。
 * @param [store] {import('pinia')} - 默认为当前页面的 store。
 * @returns {Object}
 */
export default function useTGModal({
  location = 'modalForEditing',
  modalStatusFieldName = 'showModalForEditing',
  modalProps,
  form,
  store
}) {
  const style = ref('')
  const initialPosition = ref({ x: 0, y: 0 })
  const isDragging = ref(false)
  const currentOffset = ref({ x: 0, y: 0 })

  if (!store) {
    store = useStore()
  }

  const {
    onCancel,
    onOk,
    okButtonProps,
    ...restModalProps
  } = modalProps

  const _modalProps = reactive(restModalProps)
  const _okButtonProps = reactive(okButtonProps)
  const _okButtonLoading = ref(false)
  const open = computed(() => store[modalStatusFieldName])
  const currentItem = computed(() => store.currentItem)
  const modalContentLoading = computed({
    get: () => {
      if (!('loading' in store[location])) {
        store[location].loading = false
      }

      return store[location].loading
    },
    set: val => store[location].loading = val
  })

  watch(open, val => {
    if (!val) {
      store.setLoading({
        value: false,
        stateName: 'loading',
        location
      })
      form?.resetFields()
      form?.clearValidate()
      initialPosition.value = { x: 0, y: 0 }
      currentOffset.value = { x: 0, y: 0 }
      style.value = `translate(${currentOffset.value.x}px, ${currentOffset.value.y}px)`
    }
  })

  /**
   * 关闭弹窗
   * @returns {Promise<void>}
   */
  async function handleCancel() {
    if (typeof onCancel === 'function') {
      onCancel()
    }
  }

  async function handleOk() {
    if (typeof onOk === 'function') {
      handleModalContentStatusChange(true)
      await onOk()
      handleModalContentStatusChange(false)
    } else {
      console.warn('tgModal：未找到 okButton 点击事件绑定的函数，请确认！')
    }
  }

  function handleModalContentStatusChange(status) {
    _okButtonLoading.value = status
    _okButtonProps.disabled = status
    store.setLoading({ stateName: 'loading', location })
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
  const TGModal = {
    name: 'TGModal',
    props: {
      readonly: {
        type: Boolean,
        default: false
      }
    },
    setup(props, { slots }) {
      provide('inModal', true)

      return () => (
        <Modal
          class={'tg-modal'}
          getContainer={() => document.querySelector('.tg-container-modals')}
          vModel:open={store[modalStatusFieldName]}
          onCancel={handleCancel}
          onOk={handleOk}
          maskClosable={false}
          style={{ transform: style.value }}
          {...(props.readonly ? { footer: <Button onClick={handleCancel}>关闭</Button> } : {})}
          {..._modalProps}
          okButtonProps={{
            ..._okButtonProps,
            disabled: modalContentLoading.value || _okButtonProps.disabled,
            loading: _okButtonLoading.value
          }}
          title={
            <div
              style={{ cursor: 'move', userSelect: 'none' }}
              onMousedown={handleMouseDown}
              onMousemove={handleMouseMove}
              onMouseup={handleMouseUp}
            >
              {_modalProps?.title?.replace('{ACTION}', currentItem.value?.id ? '编辑' : '新增')}
            </div>
          }
        >
          <Spin spinning={modalContentLoading.value}>
            {slots.default?.()}
          </Spin>
        </Modal>
      )
    }
  }

  return {
    TGModal,
    open,
    currentItem,
    handleCancel
  }
}
