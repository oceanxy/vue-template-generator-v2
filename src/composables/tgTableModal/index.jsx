import './assets/styles/index.scss'
import useTGModal from '@/composables/tgModal'
import useTGForm from '@/composables/tgForm'
import { Button, Form } from 'ant-design-vue'
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue'
import useTGTable from '@/composables/tgTable'

export default function useTGTableModal({
  modalStatusFieldName = 'showModalForEditing',
  modalProps,
  tableProps,
  location,
  searchParamOptions,
  isGetDetails,
  setDetails,
  optionForGetList,
  rules
} = {}) {
  const { TGTable } = useTGTable({
    props: tableProps?.value || {},
    location,
    isInjectRouterQuery: false,
    optionForGetList
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
    confirmLoading: tgForm.confirmLoading,
    modalProps
  })

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
    return (
      <TGModal
        {...props}
        class={'tg-table-modal'}
        modalProps={modalProps}
      >
        {
          slots.default && (
            <TGForm class={'tg-modal-inquiry-form'}>
              {slots.default()}
              <Form.Item class={'tg-form-item-btn'}>
                <Button
                  icon={<SearchOutlined />}
                  // disabled={loading.value || buttonDisabled.value}
                  // loading={loading.value}
                  type="primary"
                  // onClick={onFinish}
                >
                  查询
                </Button>
                <Button
                  // disabled={loading.value || buttonDisabled.value}
                  // onClick={onClear}
                  icon={<ReloadOutlined />}
                >
                  重置
                </Button>
              </Form.Item>
            </TGForm>
          )
        }
        <TGTable style={{ marginTop: '12px' }} />
      </TGModal>
    )
  }

  return {
    TGTableModal,
    ...tgModal,
    ...tgForm
  }
}
