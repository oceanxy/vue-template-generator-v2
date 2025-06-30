import './index.scss'
import { Sketch } from '@ckpack/vue-color'
import { Input, InputGroup, Popover } from 'ant-design-vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { debounce } from 'lodash'

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
  props: {
    value: {
      type: String,
      default: '#ffffff'
    },
    defaultValue: {
      type: String,
      default: ''
    }
  },
  setup(props, { attrs }) {
    const visible = ref(false)
    const colorValue = ref(props.value)
    const colorChanged = ref(false)
    let colorValidator = null

    onMounted(() => {
      colorValidator = createColorValidator()
    })

    onUnmounted(() => {
      colorValidator?.destroy()
    })

    watch(() => props.value, val => colorValue.value = val)

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
        attrs.onChange?.(finalColor)

        // 弹窗显示状态检查
        if (!visible.value) {
          colorValue.value = finalColor
        }
      } else if (colorValidator?.isValid(rawColor)) {
        // 原始格式验证通过（非HEX格式）
        colorChanged.value = true
        colorValue.value = rawColor
        attrs.onChange?.(rawColor)

        if (!visible.value) {
          colorValue.value = rawColor
        }
      }
    }, 200)

    const handleCompleteColorSelection = async () => {
      setTimeout(() => {
        if (colorChanged.value) {
          visible.value = false
        }

        colorChanged.value = false
      }, 200)
    }

    return () => (
      <InputGroup class={'tg-color-picker-preview'}>
        <Popover
          vModel:open={visible.value}
          trigger="click"
          overlayClassName="tg-color-picker-popover"
        >
          {{
            default: () => (
              <Input
                allowClear
                placeholder="请输入颜色值"
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
              />),
            content: () => (
              <Sketch
                modelValue={colorValue.value}
                onUpdate:modelValue={handleColorChange}
                presetColors={[]}
                onMouseup={() => handleCompleteColorSelection()}
              />
            )
          }}
        </Popover>
      </InputGroup>
    )
  }
}
