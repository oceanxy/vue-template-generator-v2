import useTGTableModal from '@/composables/tgTableModal'

export default {
  name: 'TGModalForNonCompliantData',
  props: {
    illegalDataFileName: {
      type: String,
      required: true
    },
    apiNameForDownloadIllegalData: {
      type: String,
      required: true
    },
    columns: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const modalStatusFieldName = 'showModalForNonCompliantData'
    const location = 'modalForNonCompliantData'

    const {
      handleExport,
      TGTableModal,
      store
    } = useTGTableModal({
      isStaticTable: true,
      modalStatusFieldName,
      location,
      modalProps: {
        width: 1400,
        title: '校验失败数据',
        cancelText: '关闭',
        okText: '导出',
        onOk: () => handleExport({
          apiName: props.apiNameForDownloadIllegalData,
          fileName: props.illegalDataFileName,
          modalStatusFieldName
        }),
        onCancel() {
          store.setList('dataSource', [], location)
        }
      },
      tableProps: {
        columns: props.columns
      }
    })

    return () => <TGTableModal />
  }
}
