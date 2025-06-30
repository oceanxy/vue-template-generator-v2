import { Button, message, Modal, Upload } from 'ant-design-vue'
import { getBase64, getFirstLetterOfEachWordOfAppName, getUUID } from '@/utils/utilityFunction'
import { computed, ref, watch } from 'vue'
import configs from '@/configs'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { cloneDeep } from 'lodash'

const appName = getFirstLetterOfEachWordOfAppName()

export default {
  name: 'TGUpload',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    // 最大数量
    limit: {
      type: Number,
      default: 5
    },
    /**
     * 新上传的文件优先。
     * 当`limit`的值为`1`时：
     * - 该值设为`false`表示新上传的文件会被舍弃并提示失败（默认）；
     * - 该值设为`true`表示新上传的文件会覆盖已上传的文件。
     */
    prioritizeNewUploads: {
      type: Boolean,
      default: false
    },
    // 默认 configs.uploadPath.common
    action: {
      type: String,
      default: ''
    },
    // 上传所需参数或返回上传参数的方法
    data: Upload.props.data,
    accept: {
      type: String,
      default: '*'
    },
    placeholder: {
      type: String,
      default: '选择文件'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // 限制文件大小，单位 Mb
    fileSize: {
      type: Number,
      default: 2
    },
    listType: {
      type: String,
      default: 'text'
    },
    // ant-design Button 组件的 type prop
    buttonType: Button.props.type,
    // ant-design Button 组件的 size prop
    buttonSize: Button.props.size,
    /**
     * 上传组件所在表单的实例对象（form，用于验证文件并反馈给表单信息）
     */
    form: {
      type: Object,
      required: false
    },
    /**
     * 通过覆盖默认的上传行为，可以自定义自己的上传实现
     */
    customRequest: {
      type: Function,
      default: null
    }
  },
  setup(props, { emit }) {
    const files = ref([])
    const fileListBackup = ref([])
    const previewImage = ref('')
    const previewVisible = ref(false)
    const name = ref('file')
    const headers = { token: localStorage.getItem(`${appName}-${configs.tokenConfig.fieldName}`) }

    const isError = computed(() => {
      return files.value.findIndex(item => item.status === 'error') > -1
    })

    watch(() => props.value, val => {
      if (props.limit === 1 && props.prioritizeNewUploads) {
        files.value = val
        fileListBackup.value = []
        return
      }

      const temp = []

      if (val?.length) {
        val.forEach(item => {
          if (!fileListBackup.value.find(i => i.uid === item.uid)) {
            if ('uid' in item) {
              temp.push(item)
            } else {
              temp.push({
                uid: getUUID(),
                key: item.key,
                url: item.path,
                status: 'done',
                name: item.fileName
              })
            }
          }
        })
      }

      // 回填上传组件
      files.value = fileListBackup.value.concat(temp)
      // 清空缓存值
      fileListBackup.value = []
    }, {
      deep: true,
      immediate: true
    })

    function beforeUpload(file, fileList) {
      // 获取名称里面的后缀
      const suffix = file.name.substring(file.name.lastIndexOf('.'))
      // 文件格式限制
      if (!file.type || suffix && !props.accept.includes(suffix)) {
        file.status = 'error'
        file.error = new Error('文件格式错误，上传失败。')
        file.response = '文件格式错误，上传失败。'

        return false
      }
      // 文件大小限制
      if (file.size / 1024 / 1024 > props.fileSize) {
        file.status = 'error'
        file.error = new Error('文件大小超过限制，上传失败。')
        file.response = '文件大小超过限制，上传失败。'

        return false
      }

      if (props.limit === 1 && props.prioritizeNewUploads) {
        return true
      }

      // 非错误状态的文件都纳入计数范围，统计已经上传和正在上传的文件的总数。
      // 超过数量限制的文件的状态将被修改为错误状态，即通知组件不再上传该文件
      const index = files.value.concat(fileList)
        .filter(item => item.status !== 'error')
        .findIndex(item => item.uid === file.uid)

      if (index >= props.limit) {
        file.status = 'error'
        file.error = new Error('文件上传数量超过限制，上传失败')
        file.response = '文件上传数量超过限制，上传失败'

        return false
      }
    }

    async function handlePreview(file) {
      const imgType = /(bmp|gif|jpe?g|png|svg|webp)$/i
      const imgSuffix = /(\.bmp|\.gif|\.jpg|\.jpeg|\.png|\.svg|\.webp)$/i

      if ('type' in file) {
        if (!imgType.test(file.type)) {
          return message.warning('只支持图片预览')
        }
      } else {
        if (!imgSuffix.test(file.name)) {
          return message.warning('只支持图片预览')
        }
      }

      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj)
      }

      previewImage.value = file.url || file.preview
      previewVisible.value = true
    }

    function handleCancel() {
      previewVisible.value = false
    }

    function handleChange({ fileList, file }) {
      let _fileList

      if (props.limit === 1 && props.prioritizeNewUploads) {
        _fileList = [file]
      } else {
        _fileList = [...fileList]
      }

      _fileList = _fileList.map(file => {
        if (file.status === 'done' && 'response' in file) {
          if (file.response.status) {
            if (Array.isArray(file.response.data)) {
              file.url = file.response.data[0].path
              file.key = file.response.data[0].key
            }
          } else {
            file.status = 'error'
            file.response = file.response.message
          }
        }

        return file
      })

      // 为上传组件赋值
      files.value = _fileList
      // 缓存值
      fileListBackup.value = cloneDeep(_fileList)

      // if (isError.value) {
      //   // 只要存在错误，就清空回传的文件
      //   emit('update:value', [])
      // } else {
      //   // 没有报错，回传已经上传成功的文件
      //   emit('update:value', fileList.value.filter(item => item.status === 'done'))
      // }

      // todo 为了解决部分项目bug，暂时回传已经上传成功的文件，后续有需求再来优化
      emit('update:value', files.value.filter(item => item.status === 'done'))
    }

    return () => (
      <div
        style={{
          margin: '4px 0',
          lineHeight: 0,
          flex: 'auto'
        }}
      >
        <Upload
          accept={props.accept}
          action={props.action || configs.uploadPath.common}
          data={props.data}
          listType={props.listType}
          name={name.value}
          fileList={files.value}
          onPreview={handlePreview}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          headers={headers}
          multiple={true}
          disabled={props.disabled}
          customRequest={
            props.customRequest
              ? rcUploadResponse => props.customRequest(rcUploadResponse)
              : null
          }
        >
          {
            ((props.limit === 1 && props.prioritizeNewUploads) || props.limit > files.value.length) && (
              props.listType === 'picture-card'
                ? (
                  <div>
                    <PlusOutlined />
                    <p>{props.placeholder}</p>
                  </div>
                )
                : (
                  <Button
                    disabled={props.disabled}
                    type={props.buttonType}
                    size={props.buttonSize}
                  >
                    <UploadOutlined />
                    {props.placeholder}
                  </Button>
                )
            )
          }
        </Upload>
        <Modal
          open={previewVisible.value}
          footer={null}
          onCancel={handleCancel}
        >
          <img
            alt="example"
            style="width: 100%"
            src={previewImage.value}
          />
        </Modal>
      </div>
    )
  }
}
