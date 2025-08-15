import { Input } from 'ant-design-vue'
import { inject, ref, watch } from 'vue'
import './index.scss'

export default {
  name: 'PropertyImage',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  setup(props, { emit, slots }) {
    const CustomUpload = inject('propPanelCustomUpload', null)
    const inputValue = ref(props.value)

    watch(() => props.value, newVal => {
      if (newVal !== inputValue.value) {
        inputValue.value = newVal
      }
    })

    watch(inputValue, val => {
      handleInputChange({ target: { value: val } })
    })

    const handleInputChange = e => {
      inputValue.value = e.target.value
      emit('change', inputValue.value)
    }

    return () => (
      <div class={'tg-designer-property-comp tg-designer-property-comp-image'}>
        <div class={'tg-designer-property-comp-image-wrapper'}>
          <Input
            value={inputValue.value}
            onChange={handleInputChange}
            allowClear
            maxLength={250}
            placeholder={'请输入图片地址'}
          >
            {{
              addonAfter: () => CustomUpload
                ? <CustomUpload vModel:value={inputValue.value}>{slots}</CustomUpload>
                : null
            }}
          </Input>
        </div>
      </div>
    )
  }
}
