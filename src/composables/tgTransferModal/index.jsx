import './assets/styles/index.scss'
import useTGModal from '@/composables/tgModal'
import useTGForm from '@/composables/tgForm'
import { Button, Form, Spin, Transfer } from 'ant-design-vue'
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { computed, reactive, watch } from 'vue'
import { set } from 'lodash/object'

/**
 * TGTransferModal
 * @note 本组件内需调用的接口及其调用顺序
 *  - 1、初始化搜索表单内的枚举（如果有），同时获取transfer选中数据（右侧数据）;
 *  - 2、初始化transfer的数据源（左侧数据），通过调用tgForm组件的搜索功能实现（依赖搜索表单的枚举执行情况）。
 * @param isStatic {boolean} - 是否为静态组件，默认为false。
 * @param modalStatusFieldName
 * @param modalProps
 * @param transferProps
 * @param location
 * @param searchParamOptions {SearchParamOption[]}
 * @param [setTargetKeys] {(data: Array, store: import('pinia').defineStore) => void} - 设置组件`targetKeys`的函数，如果不为函数，
 * 会将数据与`currentItem`合并。
 * @param [paramsOfGetTargetKeys] {((currentItem:Object) => Object) | Object} - 自定义获取`targetKeys`的参数，
 * 默认为`store.state.currentItem.id`。参数为`currentItem`。
 * @param isGetTargetKeys {boolean} - 是否获取`targetKeys`。
 * @param apiNameOfGetTargetKeys {string} - 获取`targetKeys`的接口名称，默认为`get{route.name}`。
 * @param optionsOfGetDataSource {Object} - 执行搜索表单入参，具体请参考 API `store.getList`。如其内未定义`location`，
 *  会默认使用`useTGTransferModal`的`location`
 * @returns {{TGTransferModal: (function({readonly?: boolean}, {slots: *}): *), open: ComputedRef<*>, currentItem: ComputedRef<*>, handleCancel: function({callback?: (function(): void)}=): Promise<void>}}
 */
export default function useTGTransferModal({
  isStatic,
  location = 'modalForEditing',
  modalStatusFieldName = 'showModalForEditing',
  modalProps,
  transferProps,
  searchParamOptions,
  paramsOfGetTargetKeys,
  isGetTargetKeys,
  setTargetKeys,
  apiNameOfGetTargetKeys,
  optionsOfGetDataSource
} = {}) {
  let confirmLoading
  let tgForm = {}
  let TGForm

  if (!isStatic) {
    const { TGForm: _TGForm, ..._tgForm } = useTGForm({
      isSearchForm: true,
      location,
      modalStatusFieldName,
      searchParamOptions,
      isGetDetails: isGetTargetKeys,
      setDetails: setTargetKeys,
      getParams: paramsOfGetTargetKeys,
      apiName: apiNameOfGetTargetKeys
    })

    tgForm = _tgForm
    TGForm = _TGForm
    confirmLoading = tgForm.confirmLoading
  } else {
    confirmLoading = computed(() => tgForm.store[location].dataSource?.loading ?? false)
  }

  const dataSource = computed(() => tgForm.store[location].dataSource)
  const _modalProps = reactive(modalProps)

  const { TGModal, ...tgModal } = useTGModal({
    location,
    modalStatusFieldName,
    store: tgForm.store,
    modalProps,
    confirmLoading,
    form: {
      clearValidate: tgForm.clearValidate,
      resetFields: tgForm.resetFields
    }
  })

  if (!isStatic) {
    watch([tgModal.open, tgForm.initSearchParamResult], async val => {
      if (!val.some(item => !item)) {
        await transferModalSearchCallback()
      }
    })
  }

  async function transferModalSearchCallback() {
    await tgForm.store.execSearch({
      location,
      isMergeParam: true,
      ...optionsOfGetDataSource
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
  const TGTransferModal = {
    name: 'TGTransferModal',
    props: {
      value: {
        type: Array,
        default: () => []
      }
    },
    setup(props, { emit, slots }) {
      return () => (
        <TGModal {...props} class={'tg-transfer-modal'}>
          {
            !isStatic && !!slots.default && (
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
            spinning={dataSource.value.loading}
          >
            <Transfer
              {...transferProps}
              dataSource={dataSource.value.list}
              targetKeys={props.value}
              disabled={confirmLoading.value.loading}
              onChange={(targetKeys, direction, moveKeys) => {
                emit('update:value', targetKeys)
                set(_modalProps, 'okButtonProps.disabled', !targetKeys.length)
              }}
            />
          </Spin>
        </TGModal>
      )
    }
  }

  return {
    TGTransferModal,
    ...tgModal,
    ...tgForm
  }
}
