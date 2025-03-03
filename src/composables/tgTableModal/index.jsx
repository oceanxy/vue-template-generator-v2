import './assets/styles/index.scss'
import useTGModal from '@/composables/tgModal'
import useTGForm from '@/composables/tgForm'
import { Button, Form } from 'ant-design-vue'
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue'
import useTGTable from '@/composables/tgTable'
import { computed, watch } from 'vue'

export default function useTGTableModal({
  isStaticTable,
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
  let confirmLoading
  let tgForm = {}
  let TGForm

  const { TGTable, ...tgTable } = useTGTable({
    isStaticTable,
    props: tableProps || {},
    location,
    isInjectRouterQuery: false,
    optionsOfGetList
  })

  if (!isStaticTable) {
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
    confirmLoading = computed(() => tgTable.store[location]?.dataSource?.loading ?? false)
  }

  const { TGModal, ...tgModal } = useTGModal({
    location,
    modalStatusFieldName,
    modalProps,
    store: tgTable.store,
    confirmLoading
  })

  const loading = computed(() => tgTable.store[location].dataSource.loading)

  if (!isStaticTable) {
    watch(tgModal.open, async val => {
      if (val) {
        await tableModalSearchCallback()
      }
    })
  }

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
      confirmLoading.value ||
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
      <TGModal {...props} class={'tg-table-modal'}>
        {
          !isStaticTable && !!slots.default && (
            <TGForm class={'tg-table-modal-inquiry-form'}>
              {slots.default()}
              <Form.Item class={'tg-form-item-btn'}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  disabled={confirmLoading.value || tgForm.buttonDisabled.value}
                  loading={confirmLoading.value}
                  onClick={() => tgForm.handleFinish({
                    callback: tableModalSearchCallback
                  })}
                >
                  查询
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  disabled={confirmLoading.value || tgForm.buttonDisabled.value}
                  onClick={() => tgForm.handleClear({ callback: tableModalSearchCallback })}
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
