import { computed, markRaw, toRaw } from 'vue'
import { debounce } from 'lodash'
import { useEditorStore } from '../../stores/useEditorStore'
import { Empty, Tooltip } from 'ant-design-vue'
import { Geometry } from '@/components/TGDesigner/utils/geometry'
import { TG_MATERIAL_CATEGORY_LABEL } from '@/components/TGDesigner/materials'
import { styleWithUnits } from '@/components/TGDesigner/utils/style'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
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

    const handleInput = (e, prop, modelProp) => {
      const value = modelProp && modelProp !== 'value' ? e.target?.[modelProp] ?? e : e.target?.value ?? e

      // 批量处理组件元数据（TGComponentMeta）中的多个属性（props）
      if (prop === '{props}' && Object.prototype.toString.call(value) === '[object Object]') {
        Object.assign(componentProps.value, value)
      } else {
        const property = Geometry.checkPropertyPath(componentProps.value, prop, value)

        if (!property.exists) {
          if (prop.includes('.')) {
            throw new Error(property.operation)
          } else {
            componentProps.value.style[prop] = value
          }
        }
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

    const handlePropertyChange = (e, prop, modelProp) => {
      handleInput(e, prop, modelProp)
      updateSchema()
    }

    /**
     * 删除对象中 _ 开头的属性
     * @param obj
     * @returns {{}}
     */
    const filterUnderscoreKeys = (obj) => {
      const result = {}

      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && !key.includes('_')) {
          result[key] = obj[key]
        }
      }

      return result
    }

    const renderPropertyConfigForm = propConfigForm => {
      if (typeof propConfigForm === 'function') {
        propConfigForm = propConfigForm(componentProps.value)
      }

      return propConfigForm.map(property => {
        if ('items' in property) {
          return (
            <div class="tg-designer-field-group">
              <div class="tg-designer-field-title">{property.label}</div>
              <div class="tg-designer-field-content">
                {renderPropertyConfigForm(property.items)}
              </div>
            </div>
          )
        }

        const CanvasProperty = markRaw(property.component)
        const propertyProps = { ...property.props }

        if (property.modelProp) {
          if (property.prop === '{props}') {
            propertyProps[property.modelProp] = componentProps.value
          } else {
            const propertyByPath = Geometry.checkPropertyPath(componentProps.value, property.prop)

            if (propertyByPath.exists) {
              propertyProps[property.modelProp] = propertyByPath.value
            } else if (property.prop.includes('.')) {
              throw new Error(`${property.prop} is not a valid property path`)
            } else {
              propertyProps[property.modelProp] = componentProps.value.style[property.prop]
            }
          }
        }

        const getCanvasProperty = () => {
          let slots = null

          if (property.slots) {
            slots = filterUnderscoreKeys(toRaw(property.slots))
          }

          if (property.componentType === 'input') {
            return (
              <CanvasProperty
                {...propertyProps}
                onClick={e => e.currentTarget.select()}
                onInput={e => handleInput(e, property.prop, property.modelProp)}
                onChange={updateSchema}
                onCompositionstart={e => e.target.composing = true}
                onCompositionend={e => {
                  e.target.composing = false
                  e.target.dispatchEvent(new Event('input'))
                }}
              >
                {slots}
              </CanvasProperty>
            )
          } else {
            if (property.componentType === 'multiInput') {
              propertyProps.prop = property.prop
            }

            return (
              <CanvasProperty
                {...propertyProps}
                onChange={e => {
                  // 防止动态组件内部子组件的change事件冒泡
                  if (!e.preventDefault) {
                    handlePropertyChange(e, property.prop, property.modelProp)
                  }
                }}
              >
                {slots}
              </CanvasProperty>
            )
          }
        }

        const style = styleWithUnits({
          width: property.layout === 'full' ? '100%' : 'calc((100% - 10px) / 2)'
        })

        return (
          <div
            key={property.prop}
            class="tg-designer-form-item"
            style={style}
          >
            {
              property.label && (
                <label>
                  {property.label}
                  {property.title && (
                    <Tooltip
                      placement="topLeft"
                      title={property.title}
                      overlayClassName="tg-tooltip-format"
                    >
                      <QuestionCircleOutlined />
                    </Tooltip>
                  )}
                </label>
              )
            }
            <div class="tg-designer-form-item-control">
              {getCanvasProperty()}
            </div>
          </div>
        )
      })
    }

    return () => {
      if (!selectedComponent.value?.propConfigForm) {
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
            {renderPropertyConfigForm(toRaw(selectedComponent.value.propConfigForm))}
          </div>
        </div>
      )
    }
  }
}
