import { ref, watch } from 'vue'
import Upload from '../Upload'
import ColorPicker from '../ColorPicker'
import { Button } from 'ant-design-vue'
import './index.scss'

export default {
  name: 'PropertyBackgroundImage',
  emits: ['change', 'update:value'],
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  setup(props, { emit }) {
    const mode = ref('image')
    const isUserSwitching = ref(false)
    const value = ref(props.value)

    watch(() => props.value, val => {
      if (isUserSwitching.value) return

      if (
        !val ||
        val.startsWith('url(') ||
        val.startsWith('http://') ||
        val.startsWith('https://')
      ) {
        mode.value = 'image'
      } else {
        mode.value = 'color'
      }

      value.value = val
    }, { immediate: true })

    const handleModeChange = () => {
      isUserSwitching.value = true

      if (mode.value === 'image') {
        value.value = 'linear-gradient(to right, transparent, transparent)'
        mode.value = 'color'
      } else {
        value.value = ''
        mode.value = 'image'
      }

      emit('change', value.value)
      emit('update:value', value.value)
    }

    const handleChange = val => {
      value.value = val
      emit('change', val)
      emit('update:value', val)
    }

    return () => (
      <div class={'tg-designer-property-comp tg-designer-property-background-image'}>
        <div class={'tg-designer-property-background-image-wrapper'}>
          {
            mode.value === 'image'
              ? (
                <Upload
                  value={value.value}
                  onChange={handleChange}
                  {...props}
                >
                  {{ default: () => <IconFont type={'icon-designer-property-upload'} /> }}
                </Upload>
              )
              : (
                <ColorPicker
                  value={value.value}
                  gradient
                  onChange={handleChange}
                  {...props}
                />
              )
          }
        </div>
        <div class={'tg-designer-property-expend'}>
          <Button
            type={'text'}
            title={`切换为${mode.value === 'image' ? '渐变色' : '图片'}模式`}
            disabled={props.disabled}
            onClick={handleModeChange}
          >
            <IconFont type={'icon-designer-property-multi-input-expend'} />
          </Button>
        </div>
      </div>
    )
  }
}
