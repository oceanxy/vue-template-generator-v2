import { Sketch } from '@ckpack/vue-color'
import { Button, Input, InputGroup, Tooltip } from 'ant-design-vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { debounce } from 'lodash'
import './index.scss'

// 创建全局颜色验证工具
const createColorValidator = () => {
  const el = document.createElement('div')

  el.style.position = 'absolute'
  el.style.left = '-9999px'
  el.style.visibility = 'hidden'
  document.body.appendChild(el)

  return {
    isValid: (color) => {
      if (!color) return true // 允许清空

      el.style.backgroundColor = ''
      el.style.backgroundColor = color

      return el.style.backgroundColor !== ''
    },
    destroy: () => {
      document.body.removeChild(el)
    }
  }
}

// 检测是否为有效的HEX格式（3-8位，不含#）
const isPotentialHex = (str) => {
  return /^[0-9a-f]{3,8}$/i.test(str)
}

export default {
  name: 'TGColorPicker',
  emits: ['change', 'update:value'],
  props: {
    value: {
      type: String,
      default: '#ffffff'
    },
    defaultValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入颜色值'
    }
  },
  setup(props, { attrs, emit }) {
    const colorValue = ref(props.value)
    const colorChanged = ref(false)
    const isEyeDropperSupported = ref(false) // 吸管功能支持状态
    let colorValidator = null

    onMounted(() => {
      colorValidator = createColorValidator()
      // 检测浏览器是否支持 EyeDropper API
      isEyeDropperSupported.value = !!window.EyeDropper
    })

    onUnmounted(() => {
      colorValidator?.destroy()
    })

    watch(() => props.value, val => colorValue.value = val)

    const handleEyeDropper = async () => {
      try {
        const eyeDropper = new window.EyeDropper()
        const { sRGBHex } = await eyeDropper.open()
        handleColorChange(sRGBHex)
      } catch (err) {
        console.error('吸管操作失败:', err)
      }
    }

    // 重构颜色变更处理逻辑
    const handleColorChange = debounce(input => {
      let rawColor

      // 处理不同类型输入
      if (typeof input === 'object') {
        rawColor = input.a === 1 ? input.hex : input.hex8
      } else {
        rawColor = input
      }

      rawColor = rawColor.trim()

      // 智能处理HEX格式（自动补全#）
      let finalColor = rawColor
      if (isPotentialHex(rawColor)) {
        // 自动添加#前缀并转换为小写
        finalColor = `#${rawColor.toLowerCase()}`
      }

      // 验证颜色格式
      if (colorValidator?.isValid(finalColor)) {
        colorChanged.value = true
        colorValue.value = finalColor
        emit('update:value', finalColor)
        emit('change', finalColor)
      } else if (colorValidator?.isValid(rawColor)) {
        // 原始格式验证通过（非HEX格式）
        colorChanged.value = true
        colorValue.value = rawColor
        emit('update:value', rawColor)
        emit('change', rawColor)
      }
    }, 200)

    return () => (
      <InputGroup class={'tg-color-picker-preview'}>
        <Tooltip
          color={'#ffffff'}
          trigger="click"
          overlayClassName="tg-color-picker-popover"
        >
          {{
            default: () => (
              <Input
                allowClear
                placeholder={props.placeholder}
                value={colorValue.value}
                onClick={e => e.currentTarget.select()}
                onInput={e => handleColorChange(e.target.value)}
                prefix={
                  <div
                    class={{
                      'color-block': true,
                      'color-block-empty': !colorValue.value
                    }}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      backgroundColor: colorValue.value,
                      cursor: 'pointer',
                      border: '1px solid #d9d9d9'
                    }}
                  />
                }
                addonAfter={
                  isEyeDropperSupported.value && (
                    <Button
                      type="text"
                      onClick={e => {
                        e.stopPropagation()
                        handleEyeDropper()
                      }}
                      title="使用吸管取色"
                    >
                      <IconFont type={'icon-color-picker'} />
                    </Button>
                  )
                }
              />
            ),
            title: () => (
              <Sketch
                modelValue={colorValue.value}
                onUpdate:modelValue={handleColorChange}
                onDragstart={(e) => {
                  // 解决Sketch Bug：在色板上首次点选颜色后，如果下一次操作为拖动选择颜色，则会出现禁用符号，
                  // 且松开鼠标后，没有释放dragover或mouseUp事件
                  e.preventDefault()
                }}
                presetColors={[
                  '#ffffff',
                  '#ededed',
                  '#999999',
                  'gray',
                  '#666666',
                  '#333333',
                  '#000000',
                  'pink',
                  'red',
                  'blue',
                  '#92d826',
                  'green',
                  'yellow',
                  'orange',
                  'cyan',
                  'purple'
                ]}
              />
            )
          }}
        </Tooltip>
      </InputGroup>
    )
  }
}
