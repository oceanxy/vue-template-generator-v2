import './assets/styles/index.scss'
import useTGModal from '@/composables/tgModal'
import useTGForm from '@/composables/tgForm'
import { Button, Form, Spin, Transfer } from 'ant-design-vue'
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { computed, ref, watch } from 'vue'

/**
 *
 * @param showSearch
 * @param isStaticTransfer
 * @param modalStatusFieldName
 * @param modalProps
 * @param transferProps
 * @param location
 * @param searchParamOptions
 * @param isGetDetails
 * @param setDetails
 * @param optionsOfGetList {Object} - 请求接口的options，如未定义，会默认使用useTGTransferModal的location
 * @param rules
 * @returns {{TGTransferModal: (function({readonly?: boolean}, {slots: *}): *), open: ComputedRef<*>, currentItem: ComputedRef<*>, modalContentLoading: ComputedRef<*>, handleCancel: function({callback?: (function(): void)}=): Promise<void>}}
 */
export default function useTGTransferModal({
  showSearch = true,
  isStaticTransfer = false,
  modalStatusFieldName = 'showModalForEditing',
  modalProps,
  transferProps,
  location,
  searchParamOptions,
  isGetDetails,
  setDetails,
  optionsOfGetList,
  rules
} = {}) {
  let confirmLoading
  let tgForm = {}
  let TGForm

  if (showSearch) {
    const { TGForm: _TGForm, ..._tgForm } = useTGForm({
      location,
      rules,
      searchParamOptions,
      isGetDetails,
      setDetails,
      modalStatusFieldName
    })

    tgForm = _tgForm
    TGForm = _TGForm
    confirmLoading = tgForm.confirmLoading
  } else {
    confirmLoading = computed(() => tgForm.store[location].dataSource?.loading ?? false)
  }

  const dataSource = computed(() => tgForm.store[location].dataSource)
  const targetKeys = ref([])
  const selectedKeys = ref([])

  const { TGModal, ...tgModal } = useTGModal({
    modalStatusFieldName,
    store: tgForm.store,
    confirmLoading
  })

  if (showSearch && !isStaticTransfer) {
    watch(tgModal.open, async val => {
      if (val) {
        await tgForm.store.execSearch({
          location,
          isMergeParam: true,
          ...optionsOfGetList
        })
      }
    })
  }

  async function transferModalSearchCallback() {
    await tgForm.store.execSearch({
      location,
      isMergeParam: true,
      ...optionsOfGetList
    })
  }

  /**
   * 含有表格的弹窗
   * @param props
   * @config [readonly] {boolean} - 只读弹窗，为true时，弹窗按钮只显示为一个关闭按钮。
   * 若要更改按钮的文本请参照 ant-design-vue modal 组件的 API。
   * @param slots
   * @returns {JSX.Element}
   * @constructor
   */
  function TGTransferModal(props, { slots }) {
    return (
      <TGModal
        {...props}
        class={'tg-transfer-modal'}
        modalProps={modalProps}
      >
        {
          showSearch && !!slots.default && (
            <TGForm class={'tg-transfer-modal-inquiry-form'}>
              {slots.default()}
              <Form.Item class={'tg-form-item-btn'}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  disabled={confirmLoading.value || dataSource.value.loading || tgForm.buttonDisabled.value}
                  loading={confirmLoading.value || dataSource.value.loading}
                  onClick={() => tgForm.handleFinish({
                    callback: transferModalSearchCallback
                  })}
                >
                  查询
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  disabled={confirmLoading.value || dataSource.value.loading || tgForm.buttonDisabled.value}
                  onClick={() => tgForm.handleClear({ callback: transferModalSearchCallback })}
                >
                  重置
                </Button>
              </Form.Item>
            </TGForm>
          )
        }
        <Spin
          wrapperClassName={'tg-transfer-modal-content'}
          spinning={confirmLoading.value || dataSource.value.loading}
        >
          <Transfer
            {...transferProps}
            dataSource={dataSource.value.list}
            vModel:targetKeys={targetKeys.value}
            vModel:selectedKeys={selectedKeys.value}
          />
        </Spin>
      </TGModal>
    )
  }

  return {
    TGTransferModal,
    ...tgModal,
    ...tgForm
  }
}
