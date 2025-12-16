import './assets/styles/index.scss'
import { computed, provide, ref, watch, watchEffect } from 'vue'
import { Button, Modal, Spin } from 'ant-design-vue'
import useStore from '@/composables/tgStore'
import { set } from 'lodash/object'
import { useDraggable } from '@vueuse/core'

/**
 * TGModal 组件
 * @param [location='modalForEditing'] {string} - 弹窗位置，默认为 'modal'。
 * @param [modalStatusFieldName='showModalForEditing'] {string}
 * @param [modalProps] {import('ant-design-vue').ModalProps} - 弹窗的属性。
 * @param [store] {import('pinia')} - 默认为当前页面的 store。
 * @returns {Object}
 */
export default function useTGModal({
  location = 'modalForEditing',
  modalStatusFieldName = 'showModalForEditing',
  modalProps,
  store
}) {
  if (!store) {
    store = useStore()
  }

  const _modalProps = computed(() => {
    // 保存原始函数
    const originalOnCancel = modalProps?.onCancel
    const originalOnOk = modalProps?.onOk

    // 创建新对象，避免修改原始对象
    return {
      ...modalProps,
      onCancel: async () => {
        store.setVisibilityOfModal({
          modalStatusFieldName,
          location,
          value: false
        })

        if (typeof originalOnCancel === 'function') {
          originalOnCancel()
        }
      },
      onOk: async () => {
        if (typeof originalOnOk === 'function') {
          handleModalContentStatusChange(true)
          await originalOnOk()
          handleModalContentStatusChange(false)
        } else {
          throw new Error('tgModal：未找到 okButton 点击事件绑定的函数，请确认！')
        }
      }
    }
  })
  const _okButtonProps = computed(() => _modalProps.value.okButtonProps || {})
  const open = computed(() => store[modalStatusFieldName])
  const currentItem = computed(() => store.currentItem)
  const modalContentLoading = computed({
    get: () => {
      if (!store[location] || !('loading' in store[location])) {
        set(store, `${location}.loading`, false)
      }

      return store[location].loading
    },
    set: val => store[location].loading = val
  })

  const modalTitleRef = ref(null)
  const _okButtonLoading = ref(false)
  const _okButtonDisabled = ref(false)
  const startX = ref(0)
  const startY = ref(0)
  const startedDrag = ref(false)
  const transformX = ref(0)
  const transformY = ref(0)
  const preTransformX = ref(0)
  const preTransformY = ref(0)
  const dragRect = ref({ left: 0, right: 0, top: 0, bottom: 0 })

  const { x, y, isDragging } = useDraggable(modalTitleRef)

  watch([x, y], () => {
    if (!startedDrag.value) {
      startX.value = x.value
      startY.value = y.value
      const bodyRect = document.body.getBoundingClientRect()
      const titleRect = modalTitleRef.value.getBoundingClientRect()
      dragRect.value.right = bodyRect.width - titleRect.width
      dragRect.value.bottom = bodyRect.height - titleRect.height
      preTransformX.value = transformX.value
      preTransformY.value = transformY.value
    }
    startedDrag.value = true
  })

  watch(isDragging, () => {
    if (!isDragging) {
      startedDrag.value = false
    }
  })

  watchEffect(() => {
    if (startedDrag.value) {
      transformX.value =
        preTransformX.value +
        Math.min(Math.max(dragRect.value.left, x.value), dragRect.value.right) -
        startX.value
      transformY.value =
        preTransformY.value +
        Math.min(Math.max(dragRect.value.top, y.value), dragRect.value.bottom) -
        startY.value
    }
  })

  const transformStyle = computed(() => {
    return {
      transform: `translate(${transformX.value}px, ${transformY.value}px)`
    }
  })

  watch(open, val => {
    if (!val) {
      store.setLoading({
        value: false,
        stateName: 'loading',
        location
      })
    }
  })

  function handleModalContentStatusChange(status) {
    _okButtonLoading.value = status
    _okButtonDisabled.value = status
    store.setLoading({ stateName: 'loading', value: status, location })
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
          getContainer={() => document.querySelector('#tg-global-modals')}
          open={store[modalStatusFieldName]}
          maskClosable={false}
          wrapStyle={{ overflow: 'hidden' }}
          {
            ...(props.readonly
              ? {
                footer: (
                  <Button onClick={_modalProps.value.onCancel}>
                    {_modalProps.value.cancelText || '取消'}
                  </Button>
                )
              }
              : {})
          }
          {..._modalProps.value}
          okButtonProps={{
            ..._okButtonProps.value,
            disabled: modalContentLoading.value || _okButtonProps.value.disabled || _okButtonDisabled.value,
            loading: _okButtonProps.value.loading || _okButtonLoading.value
          }}
          title={
            <div ref={modalTitleRef} style={{ cursor: 'move', userSelect: 'none' }}>
              {_modalProps.value?.title?.replace(
                '{ACTION}',
                currentItem.value?.id ? '编辑' : '新增'
              )}
            </div>
          }
        >
          {{
            default: () => (
              <Spin spinning={modalContentLoading.value}>
                {slots.default?.()}
              </Spin>
            ),
            modalRender: ({ originVNode: OriginVNode }) => (
              <div style={transformStyle.value}>
                <OriginVNode />
              </div>
            )
          }}
        </Modal>
      )
    }
  }

  return {
    TGModal,
    open,
    currentItem,
    handleCancel: _modalProps.value.onCancel
  }
}
