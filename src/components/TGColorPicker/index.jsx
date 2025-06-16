import './index.scss'
import { Sketch } from '@ckpack/vue-color'
import { Button, Input, InputGroup, Popover } from 'ant-design-vue'
import { ref, watch } from 'vue'
import { ClearOutlined } from '@ant-design/icons-vue'
import { debounce } from 'lodash'

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

    watch(() => props.value, val => colorValue.value = val)

    const handleColorChange = debounce((color, isForce) => {
      if (isForce || visible.value) {
        colorChanged.value = true
        colorValue.value = color.hex
        attrs.onChange?.(color.hex)
      }
    }, 100)

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
                readonly
                placeholder="无"
                value={colorValue.value}
                onChange={e => {
                  handleColorChange(e.target.value)
                }}
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
        <Button onClick={() => handleColorChange({ hex: props.defaultValue }, true)}>
          <ClearOutlined title="清空" />
        </Button>
      </InputGroup>
    )
  }
}
