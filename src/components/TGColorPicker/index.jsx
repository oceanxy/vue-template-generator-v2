import './index.scss'
import { Sketch } from '@ckpack/vue-color'
import { Button, Input, InputGroup, Popover } from 'ant-design-vue'
import { ref, watch } from 'vue'
import { ClearOutlined } from '@ant-design/icons-vue'

export default {
  name: 'TGColorPicker',
  props: {
    value: {
      type: String,
      default: '#ffffff'
    }
  },
  setup(props, { attrs }) {
    const visible = ref(false)
    const colorValue = ref(props.value)

    watch(() => props.value, val => colorValue.value = val)

    const handleColorChange = (color) => {
      colorValue.value = color.hex
      attrs.onChange?.(color.hex)
      visible.value = false
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
                onChange={(e) => {
                  handleColorChange(e.target.value)
                }}
                prefix={
                  <div
                    class="color-block"
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
              />
            )
          }}
        </Popover>
        <Button onClick={() => handleColorChange({ hex: '' })}>
          <ClearOutlined title="清空" />
        </Button>
      </InputGroup>
    )
  }
}
