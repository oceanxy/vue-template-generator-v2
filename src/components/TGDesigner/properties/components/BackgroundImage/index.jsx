import { ref, watchEffect } from 'vue'
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
    const cachedImageValue = ref('')
    const cachedColorValue = ref('')
    const isUserSwitching = ref(false)

    watchEffect(() => {
      if (isUserSwitching.value) return

      if (
        !props.value ||
        props.value.startsWith('url(') ||
        props.value.startsWith('http://') ||
        props.value.startsWith('https://') ||
        props.value.startsWith('data:image')
      ) {
        mode.value = 'image'
        cachedImageValue.value = props.value
      } else {
        mode.value = 'color'
        cachedColorValue.value = props.value
      }
    })

    const handleModeChange = () => {
      const currentMode = mode.value
      const newMode = currentMode === 'image' ? 'color' : 'image'

      isUserSwitching.value = true

      // 缓存当前值
      if (currentMode === 'image') {
        cachedImageValue.value = props.value
      } else {
        cachedColorValue.value = props.value
      }

      // 设置新值（如果缓存值为空，使用默认值）
      let newValue = newMode === 'image'
        ? cachedImageValue.value
        : cachedColorValue.value

      // 如果切换到颜色模式且缓存值为空，使用默认渐变值
      if (newMode === 'color' && !newValue) {
        newValue = 'linear-gradient(to right, #ffffff, #000000)'
        cachedColorValue.value = newValue
      }

      // 更新模式并触发值变化
      mode.value = newMode
      emit('change', newValue)
      emit('update:value', newValue)

      // 重置标志（使用 setTimeout 确保在 watchEffect 执行后重置）
      setTimeout(() => {
        isUserSwitching.value = false
      }, 0)
    }

    const handleChange = (value) => {
      emit('change', value)
      emit('update:value', value)

      // 更新缓存值
      if (mode.value === 'image') {
        cachedImageValue.value = value
      } else {
        cachedColorValue.value = value
      }
    }

    return () => (
      <div class={'tg-designer-property-comp tg-designer-property-background-image'}>
        <div class={'tg-designer-property-background-image-wrapper'}>
          {
            mode.value === 'image'
              ? (
                <Upload
                  value={props.value}
                  onChange={handleChange}
                  {...props}
                >
                  {{ default: () => <IconFont type={'icon-designer-property-upload'} /> }}
                </Upload>
              )
              : (
                <ColorPicker
                  value={props.value}
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
