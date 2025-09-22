import './index.scss'
import { Button, message, Result } from 'ant-design-vue'
import { computed, reactive, ref, watch } from 'vue'
import useTGModal from '@/composables/tgModal'
import TGUpload from '@/components/TGUpload'
import useThemeVars from '@/composables/themeVars'
import useStore from '@/composables/tgStore'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons-vue'
import TGModalForNonCompliantData from './TGModalForNonCompliantData'
import { downloadFile } from '@/utils/utilityFunction'

export default {
  name: 'TGModalForImportExcel',
  props: {
    title: {
      type: String,
      default: '导入文件'
    },
    action: {
      type: String,
      required: true
    },
    templateFileName: {
      type: String,
      default: '模板.xlsx'
    },
    illegalDataFileName: {
      type: String,
      default: '失败数据.xls'
    },
    apiNameForDownloadTemplate: {
      type: String,
      required: true
    },
    apiNameForImportData: {
      type: [String, Object],
      required: true
    },
    apiNameForDownloadIllegalData: {
      type: String,
      required: true
    },
    extraTips: {
      type: Object,
      default: () => ({})
    },
    columns: {
      type: Array,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    },
    headers: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const store = useStore()
    const modalStatusFieldName = 'showModalForImportExcel'
    const location = 'modalForImportExcel'

    const { token } = useThemeVars()
    const fileList = ref(undefined)
    const result = computed(() => {
      return {
        failSize: fileList.value?.[0]?.response.data.failSize ?? 0,
        successSize: fileList.value?.[0]?.response.data.successSize ?? 0
      }
    })
    const verifyStatus = computed(() => {
      return result.value.failSize && result.value.successSize
        ? 'warning'
        : result.value.failSize
          ? 'error'
          : result.value.successSize ? 'success' : 'info'
    })
    const uploadStatus = ref(false)
    const uploadLoading = ref(false)
    const downloadLoading = ref(false)
    const modalProps = reactive({
      width: 800,
      title: props.title,
      okText: '导入通过数据',
      okButtonProps: {
        icon: <UploadOutlined />,
        disabled: !result.value.successSize || uploadStatus.value,
        loading: uploadLoading.value
      },
      onOk: async () => {
        uploadLoading.value = true

        const res = await store.fetch({
          apiName: props.apiNameForImportData.value,
          isRefreshTable: true,
          modalStatusFieldName,
          loading: false
        })

        if (res.status) {
          uploadStatus.value = true
          message.success('导入数据成功')

          // if (!result.value.failSize) {
          fileList.value = undefined
          uploadStatus.value = false
          // }
        }

        uploadLoading.value = false
      },
      onCancel() {
        fileList.value = undefined
        uploadStatus.value = false
      }
    })

    const { TGModal } = useTGModal({
      location,
      modalStatusFieldName,
      modalProps
    })

    watch(
      [result, uploadStatus],
      ([_result, _uploadStatus]) => {
        modalProps.okButtonProps.disabled = !_result.successSize || _uploadStatus
      },
      { deep: true }
    )

    async function handleIllegalData() {
      downloadLoading.value = true
      message.loading('正在导出校验失败的数据，请稍候...', 0)

      await store.exportData({
        fileName: props.illegalDataFileName,
        apiName: props.apiNameForDownloadIllegalData,
        location
      })

      message.destroy()
      downloadLoading.value = false
    }

    async function handleTemplateDownload() {
      const res = await store.fetch({
        apiName: props.apiNameForDownloadTemplate,
        params: {
          fileName: props.templateFileName,
        },
        location,
        loading: false
      })

      if (res.status) {
        downloadFile(res.data, props.templateFileName)
      }

      // await store.exportData({
      //   fileName: props.templateFileName,
      //   apiName: props.apiNameForDownloadTemplate,
      //   location
      // })
    }

    return () => (
      <TGModal class={'tg-data-upload-content'}>
        <div class={'tg-data-upload-functions'}>
          <Button
            danger
            type={'primary'}
            icon={downloadLoading.value ? <DownloadOutlined /> : <DownloadOutlined />}
            disabled={downloadLoading.value || !result.value.failSize}
            onClick={handleIllegalData}
          >
            下载失败数据
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleTemplateDownload}
          >
            下载模板
          </Button>
        </div>
        <div class={'tg-data-upload-trigger'}>
          <TGUpload
            vModel:value={fileList.value}
            headers={props.headers}
            buttonType={'primary'}
            action={props.action}
            data={props.data}
            accept={'.xls,.xlsx'}
            placeholder={'选择文件'}
            limit={1}
          />
        </div>
        <ol class={'shm-data-upload-note'}>
          <li>请先下载模板文件，并在模板文件中编辑好数据后上传；</li>
          <li>上传的数据文件支持XLS、XLSX格式；</li>
          <li>Excel文件中的数据请勿添加任何格式；</li>
          <li>因数据文件需要验证，上传过程需要一定的时间，请耐心等待，上传流程完成前请不要关闭页面。</li>
          {
            Array.isArray(props.extraTips.value) && props.extraTips.value.map((item, index) => (
              <li key={index}>{item}</li>
            ))
          }
        </ol>
        {
          !!fileList.value?.length && (
            <Result
              class={'shm-data-upload-result'}
              status={verifyStatus.value}
              title={'校验完成！'}
              subTitle={[
                '校验通过数据：',
                <span>{result.value.successSize} 条</span>,
                '，校验失败数据：',
                <span>{result.value.failSize} 条</span>,
                !!result.value.failSize && (
                  <Button
                    type={'link'}
                    onClick={() => store.setVisibilityOfModal({
                      beforeOpen() {
                        store.setList(
                          'dataSource',
                          fileList.value?.[0]?.response?.data?.failList ?? [],
                          'modalForNonCompliantData'
                        )
                      },
                      modalStatusFieldName: 'showModalForNonCompliantData',
                      location: 'modalForNonCompliantData'
                    })}
                  >
                    查看失败原因
                  </Button>
                )
              ]}
            >
              {verifyStatus.value === 'info' && '未在文件中检测到可用数据，请确认文件是否正确！'}
              {
                (verifyStatus.value === 'error' || verifyStatus.value === 'warning') &&
                '当前存在校验失败的数据，如需修改，请下载该数据，修改完成后再重新校验。'
              }
              {
                uploadStatus.value
                  ? (
                    <p style={{ color: token.value.colorPrimary, 'font-weight': 'bolder' }}>
                      已将校验通过的数据导入数据库。
                    </p>
                  )
                  : (verifyStatus.value === 'success' || verifyStatus.value === 'warning') &&
                  <p>如需继续，请点击“导入通过数据”按钮，以将校验通过的数据导入后台数据库。</p>
              }
            </Result>
          )
        }
        <TGModalForNonCompliantData
          apiNameForDownloadIllegalData={props.apiNameForDownloadIllegalData}
          illegalDataFileName={props.illegalDataFileName}
          columns={props.columns}
        />
      </TGModal>
    )
  }
}
