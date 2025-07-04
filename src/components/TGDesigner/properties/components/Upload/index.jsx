import { Input, Upload } from 'ant-design-vue'
import { inject, ref, watch } from 'vue'
import './index.scss'

export default {
  name: 'PropertyUpload',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  setup(props, { emit, slots }) {
    const PropertyUpload = inject('asyncPropertyUpload', null)
    const inputValue = ref(props.value)
    const uploadFiles = ref([])

    watch(() => props.value, newVal => {
      if (newVal !== inputValue.value) {
        inputValue.value = newVal
        // 清空上传组件的值
        uploadFiles.value = []
      }
    })

    const handleInputChange = (e) => {
      inputValue.value = e.target.value
      uploadFiles.value = [] // 清空上传组件
      emit('change', inputValue.value)
    }

    const handleUploadChange = (fileList) => {
      if (fileList.length > 0 && fileList[0].status === 'done') {
        const path = fileList[0].response?.path || ''
        inputValue.value = path
        emit('change', path)
      } else {
        uploadFiles.value = fileList
      }
    }

    return () => (
      <div class={'tg-designer-property-comp-upload'}>
        <div class={'tg-designer-property-comp-upload-wrapper'}>
          <Input
            value={inputValue.value}
            onChange={handleInputChange}
            allowClear
            maxLength={250}
            placeholder={'请输入图片地址'}
          />
        </div>
        <div class={'tg-designer-property-expend'} title={'上传图片'}>
          {PropertyUpload ? (
            <PropertyUpload
              value={uploadFiles.value}
              onPathChange={handleUploadChange}
              buttonType={'text'}
              placeholder={null}
              accept={'.png,.jpg,.jpeg'}
              limit={1}
              prioritizeNewUploads={true}
            >
              {slots}
            </PropertyUpload>
          ) : (
            <Upload
              fileList={uploadFiles.value}
              onChange={({ fileList }) => handleUploadChange(fileList)}
            >
              {slots}
            </Upload>
          )}
        </div>
      </div>
    )
  }
}
