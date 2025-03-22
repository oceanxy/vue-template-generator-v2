import { computed } from 'vue'
import { debounce } from 'lodash'

export default {
  name: 'PropertyPanel',
  props: ['selectedComponent', 'onUpdate', 'schema'],
  setup(props, { emit }) {
    const componentProps = computed(() => {
      const defaultProps = props.selectedComponent?.defaultProps ?? {}
      const defaultStyle = props.selectedComponent?.style ?? {}
      const schemaProps = props.schema.components.find(c => c.id === props.selectedComponent.id)?.props ?? {}
      const { style, ...restProps } = schemaProps

      return { ...defaultProps, ...restProps, style: { ...defaultStyle, ...style } }
    })

    const handlePropertyChange = (prop) => {
      return debounce(e => {
        if (prop in componentProps.value) {
          componentProps.value[prop] = e.target?.value ?? e
        } else if (prop in componentProps.value.style) {
          componentProps.value.style[prop] = e.target?.value ?? e
        }

        emit('update', componentProps.value)
      }, 200)
    }

    return () => {
      if (!props.selectedComponent?.configForm?.fields) return null

      return (
        <div class="tg-editor-property-container">
          {
            props.selectedComponent?.configForm?.fields.map(field => {
              const PropertyProp = field.component()
              const value = field.prop in componentProps.value
                ? componentProps.value[field.prop]
                : componentProps.value.style[field.prop]

              return (
                <div key={field.prop} class="tg-editor-form-item">
                  <label>{field.label}</label>
                  <PropertyProp
                    {...field.props}
                    value={value}
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
