import { ref, watch } from 'vue'
import Image from '../Image'
import ColorPicker from '../ColorPicker'
import { Button } from 'ant-design-vue'
import { debounce } from 'lodash'
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
        state.value.bgi = 'linear-gradient(90deg, #ffffff, #000000)'
        state.value.mode = 'color'
      } else {
        state.value.bgi = ''
        state.value.mode = 'image'
      }

      emit('change', state.value.bgi)
      emit('update:value', state.value.bgi)
    }

    /**
     * 检查给定的URL是否是有效的图片地址
     * @param {string} url - 待检测的URL字符串
     * @returns {boolean} - 如果是有效图片地址返回true，否则返回false
     */
    function isValidImageUrl(url) {
      try {
        const parsed = new URL(url)

        // 检查协议
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          return false
        }

        // 检查域名是否有效（至少包含两个部分）
        const domainParts = parsed.hostname.split('.')
        if (domainParts.length < 2 || domainParts.some(part => !part)) {
          return false
        }

        // 检查路径是否以图片扩展名结尾
        const path = parsed.pathname
        const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
        const lastSegment = path.split('/').pop() || ''
        const extension = lastSegment.split('.').pop() || ''

        return lastSegment.includes('.') &&
          imageExtensions.includes(extension.toLowerCase())
      } catch (e) {
        return false // URL解析失败
      }
    }

    const debouncedHandleChange = debounce((val) => {
      state.value.bgi = val

      // 当为图片模式时，检测值是否为合法图片值。非图片模式直接emit。
      if (!val || state.value.mode !== 'image' || isValidImageUrl(val)) {
        emit('change', val)
        emit('update:value', val)
      }
    }, 300)

    const handleChange = val => {
      debouncedHandleChange(val)
    }

    return () => (
      <div class={'tg-designer-property-comp tg-designer-property-background-image'}>
        <div class={'tg-designer-property-background-image-wrapper'}>
          {
            state.value.mode === 'image'
              ? (
                <Image
                  value={state.value.bgi}
                  onChange={handleChange}
                  {...props}
                >
                  {{ default: () => <IconFont type={'icon-designer-property-upload'} /> }}
                </Image>
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
