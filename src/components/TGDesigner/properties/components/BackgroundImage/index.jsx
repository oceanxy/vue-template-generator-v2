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
    const isUserSwitching = ref(false)
    // 首次读取值时，根据值判断模式。（首次的值为回填值）
    const isModeInitializationCompleted = ref(false)

    const state = ref({
      mode: 'image',
      bgi: props.value
    })

    watch(
      () => props.value,
      val => {
        if (isUserSwitching.value) {
          isUserSwitching.value = false
          return
        }

        if (!isModeInitializationCompleted.value) {
          if (
            !val ||
            val.startsWith('url(') ||
            val.startsWith('http://') ||
            val.startsWith('https://')
          ) {
            state.value.mode = 'image'
          } else {
            state.value.mode = 'color'
          }

          isModeInitializationCompleted.value = true
        }

        state.value.bgi = val
      },
      { immediate: true }
    )

    const handleModeChange = () => {
      isUserSwitching.value = true

      if (state.value.mode === 'image') {
        state.value.bgi = 'linear-gradient(to right, #ffffff, #000000)'
        state.value.mode = 'color'
      } else {
        state.value.bgi = ''
        state.value.mode = 'image'
      }

      emit('change', state.value.bgi)
      emit('update:value', state.value.bgi)
    }

    const handleChange = val => {
      state.value.bgi = val
      emit('change', val)
      emit('update:value', val)
    }

    return () => (
      <div class={'tg-designer-property-comp tg-designer-property-background-image'}>
        <div class={'tg-designer-property-background-image-wrapper'}>
          {
            state.value.mode === 'image'
              ? (
                <Upload
                  value={state.value.bgi}
                  onChange={handleChange}
                  {...props}
                >
                  {{ default: () => <IconFont type={'icon-designer-property-upload'} /> }}
                </Upload>
              )
              : (
                <ColorPicker
                  value={state.value.bgi}
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
            title={`切换为${state.value.mode === 'image' ? '渐变色' : '图片'}模式`}
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
