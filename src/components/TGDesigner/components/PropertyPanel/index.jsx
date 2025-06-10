import { computed } from 'vue'
import { debounce } from 'lodash'
import { useEditorStore } from '../../stores/useEditorStore'
import { Empty, Tooltip } from 'ant-design-vue'
import { Geometry } from '@/components/TGDesigner/utils/geometry'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { TG_MATERIAL_CATEGORY_LABEL } from '@/components/TGDesigner/materials'
import './index.scss'

export default {
  name: 'PropertyPanel',
  setup() {
    const store = useEditorStore()
    const schema = computed(() => store.schema)
    const selectedComponent = computed(() => store.selectedComponent)
    const componentSchema = computed(() => {
      return Geometry.findNestedSchema(schema.value.components, selectedComponent.value.id).schema
    })
    const componentProps = computed(() => {
      if (!store.selectedComponent) return {}

      if (store.selectedComponent.type === 'canvas') {
        return schema.value.canvas
      } else {
        const componentSchemaProps = componentSchema.value?.props ?? {}
        const defaultProps = selectedComponent.value?.defaultProps ?? {}
        const defaultStyle = {
          ...selectedComponent.value?.defaultProps.style,
          ...selectedComponent.value?.style
        }
        const { style, ...restProps } = componentSchemaProps

        return { ...defaultProps, ...restProps, style: { ...defaultStyle, ...style } }
      }
    })

    const handleInput = (e, prop) => {
      if (prop in componentProps.value) {
        componentProps.value[prop] = e.target?.value ?? e
      } else if (prop in componentProps.value.style) {
        componentProps.value.style[prop] = e.target?.value ?? e
      }
    }

    const updateSchema = debounce(() => {
      // 更新组件的 Schema
      if (store.selectedComponent?.type === 'canvas') {
        // 更新画布属性
        store.schema.canvas = schema.value.canvas
      } else {
        componentSchema.value.props = componentProps.value
      }
    }, 200)

    const handlePropertyChange = (e, prop) => {
      handleInput(e, prop)
      updateSchema()
    }

    const renderPropertyFields = (fields) => {
      return fields.map(field => {
        if ('items' in field) {
          return (
            <div class="tg-designer-field-group">
              <div class="tg-designer-field-title">{field.label}</div>
              {renderPropertyFields(field.items)}
            </div>
          )
        }

        const CanvasProperty = field.component()
        const propertyProps = { ...field.props }

        if (field.modelProp) {
          propertyProps[field.modelProp] = field.prop in componentProps.value
            ? componentProps.value[field.prop]
            : componentProps.value.style[field.prop]
        }

        const getCanvasProperty = () => {
          if (field.componentType === 'input') {
            return (
              <CanvasProperty
                {...propertyProps}
                onInput={e => handleInput(e, field.prop)}
                onChange={updateSchema}
                onCompositionstart={e => e.target.composing = true}
                onCompositionend={e => {
                  e.target.composing = false
                  e.target.dispatchEvent(new Event('input'))
                }}
              />
            )
          } else {
            return (
              <CanvasProperty
                {...propertyProps}
                onChange={value => handlePropertyChange(value, field.prop)}
              />
            )
          }
        }

        return (
          <div key={field.prop} class="tg-designer-form-item">
            <label>
              {field.label}
              <Tooltip placement="topLeft" title={field.title}>
                <QuestionCircleOutlined />
              </Tooltip>
            </label>
            <div class="tg-designer-form-item-control">
              {getCanvasProperty()}
            </div>
          </div>
        )
      })
    }

    return () => {
      if (!selectedComponent.value?.configForm?.fields) {
        return (
          <div class="tg-designer-property-container">
            <Empty description="未选中任何组件" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )
      }

      return (
        <div class="tg-designer-property-container">
          <div class="tg-designer-property-comp-type">
            {TG_MATERIAL_CATEGORY_LABEL[selectedComponent.value.category]}
            {!!TG_MATERIAL_CATEGORY_LABEL[selectedComponent.value.category] && ' - '}
            {selectedComponent.value.name}
          </div>
          <div class="tg-designer-property-scrollable tg-designer-scrollable">
            {renderPropertyFields(selectedComponent.value.configForm.fields)}
          </div>
        </div>
      )
    }
  }
}
