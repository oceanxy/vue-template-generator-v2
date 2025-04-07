import { computed } from 'vue'
import { debounce } from 'lodash'
import { useEditorStore } from '../stores/useEditorStore'
import { Empty } from 'ant-design-vue'

export default {
  name: 'PropertyPanel',
  setup() {
    const store = useEditorStore()
    const schema = computed(() => store.schema)
    const selectedComponent = computed(() => store.selectedComponent)
    const componentProps = computed(() => {
      if (!store.selectedComponent) return {}

      if (store.selectedComponent.type === 'canvas') {
        return schema.value.canvas
      } else {
        const schemaProps = schema.value.components.find(c => c.id === selectedComponent.value.id)?.props ?? {}
        const defaultProps = selectedComponent.value?.defaultProps ?? {}
        const defaultStyle = selectedComponent.value?.style ?? {}
        const { style, ...restProps } = schemaProps

        return { ...defaultProps, ...restProps, style: { ...defaultStyle, ...style } }
      }
    })

    const handlePropertyChange = (prop) => {
      return debounce(e => {
        if (prop in componentProps.value) {
          componentProps.value[prop] = e.target?.value ?? e
        } else if (prop in componentProps.value.style) {
          componentProps.value.style[prop] = e.target?.value ?? e
        }

        // 更新组件的 Schema
        if (store.selectedComponent?.type === 'canvas') {
          // 更新画布属性
          store.schema.canvas = schema.value.canvas
        } else {
          // 原有组件更新逻辑
          const componentSchema = store.schema.components.find(c => c.id === store.selectedComponent?.id)
          if (componentSchema) componentSchema.props = componentProps.value
        }
      }, 200)
    }

    return () => {
      if (!selectedComponent.value?.configForm?.fields) {
        return (
          <div class="tg-editor-property-container">
            <Empty description="未选中任何组件" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )
      }

      return (
        <div class="tg-editor-property-container">
          {
            selectedComponent.value?.configForm?.fields.map(field => {
              const CanvasProperty = field.component()
              const value = field.prop in componentProps.value
                ? componentProps.value[field.prop]
                : componentProps.value.style[field.prop]
              const propertyProps = { ...field.props }

              if (field.modelProp) {
                propertyProps[field.modelProp] = value
              }

              return (
                <div key={field.prop} class="tg-editor-form-item">
                  <label title={field.title}>{field.label}</label>
                  <CanvasProperty
                    {...propertyProps}
                    onChange={handlePropertyChange(field.prop)}
                  />
                </div>
              )
            })
          }
        </div>
      )
    }
  }
}
