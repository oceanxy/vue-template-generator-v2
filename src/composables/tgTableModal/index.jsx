import './assets/styles/index.scss'
import useTGModal from '@/composables/tgModal'
import useTGForm from '@/composables/tgForm'
import { Button, Form } from 'ant-design-vue'
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue'
import useTGTable from '@/composables/tgTable'
import { computed, watch } from 'vue'

export default function useTGTableModal({
  modalStatusFieldName = 'showModalForEditing',
  modalProps,
  tableProps,
  location,
  searchParamOptions,
  isGetDetails,
  setDetails,
  optionsOfGetList,
  rules
} = {}) {
  const { TGTable, ...tgTable } = useTGTable({
    props: tableProps || {},
    location,
    isInjectRouterQuery: false,
    optionsOfGetList
  })

  const { TGForm, ...tgForm } = useTGForm({
    location,
    rules,
    searchParamOptions,
    isGetDetails,
    setDetails,
    modalStatusFieldName
  })

  const { TGModal, ...tgModal } = useTGModal({
    modalStatusFieldName,
    store: tgForm.store,
    confirmLoading: tgForm.confirmLoading
  })

  const loading = computed(() => tgTable.store[location].dataSource.loading
  )

  watch(tgModal.open, async val => {
    if (val) {
      await tgTable.store.execSearch({
        location,
        isMergeParam: true,
        ...optionsOfGetList
      })
    }
  })

  async function tableModalSearchCallback() {
    await tgTable.store.execSearch({
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
  function TGTableModal(props, { slots }) {
    const { okButtonProps } = modalProps
    const okButtonLoading = loading.value ||
      tgModal.modalContentLoading.value ||
      tgForm.confirmLoading.value ||
      tgTable.exportButtonDisabled.value

    if (okButtonProps) {
      modalProps.okButtonProps.disabled = okButtonLoading
      modalProps.okButtonProps.loading = tgTable.exportButtonDisabled.value
    } else {
      modalProps.okButtonProps = {
        disabled: okButtonLoading,
        loading: tgTable.exportButtonDisabled.value
      }
    }

    return (
      <TGModal
        {...props}
        class={'tg-table-modal'}
        modalProps={modalProps}
      >
        {
          slots.default && (
            <TGForm class={'tg-table-modal-inquiry-form'}>
              {slots.default()}
              <Form.Item class={'tg-form-item-btn'}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  disabled={tgForm.confirmLoading.value || tgForm.buttonDisabled.value}
                  loading={tgForm.confirmLoading.value}
                  onClick={() => tgForm.handleFinish({
                    callback: tableModalSearchCallback
                  })}
                >
                  查询
                </Button>
                <Button
                  disabled={tgForm.confirmLoading.value || tgForm.buttonDisabled.value}
                  onClick={() => tgForm.handleClear({ callback: tableModalSearchCallback })}
                  icon={<ReloadOutlined />}
                >
                  重置
                </Button>
              </Form.Item>
            </TGForm>
          )
        }
        <TGTable class={'tg-table-modal-content'} />
      </TGModal>
    )
  }

  return {
    TGTableModal,
    ...tgModal,
    ...tgForm,
    ...tgTable
  }
}
