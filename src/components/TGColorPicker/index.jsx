import './index.scss'
import { Sketch } from '@ckpack/vue-color'
import { Popover } from 'ant-design-vue'
import { ref } from 'vue'

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

    const handleColorChange = (color) => {
      colorValue.value = color.hex
      attrs.onChange?.(color.hex)
      visible.value = false
    }

    return () => (
      <Popover
        vModel:open={visible.value}
        trigger="click"
        overlayClassName="tg-color-picker-popover"
      >
        {{
          default: () => (
            <div
              class="tg-color-picker-preview"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
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
              <span style={{ cursor: 'pointer' }}>{colorValue.value.toUpperCase()}</span>
            </div>
          ),
          content: () => (
            <Sketch
              modelValue={colorValue.value}
              onUpdate:modelValue={handleColorChange}
              presetColors={[]}
            />
          )
        }}
      </Popover>
    )
  }
}
