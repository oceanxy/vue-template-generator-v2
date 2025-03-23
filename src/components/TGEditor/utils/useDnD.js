import { getUUID } from '@/utils/utilityFunction'
import { useDraggable } from '@vueuse/core'

export const useDnD = (schema, store) => {
  const handleDragStart = (e, component) => {
    const { x, y } = useDraggable(e.target)

    // 携带组件类型和初始props
    e.dataTransfer.setData('componentType', component.type)
    e.dataTransfer.setData('initialProps', JSON.stringify({
      ...component.defaultProps,
      style: component.style,
      category: component.category
    }))
  }

  const handleDrop = (e) => {
    const type = e.dataTransfer.getData('componentType')
    const initialProps = JSON.parse(e.dataTransfer.getData('initialProps'))
    const { category, ...restInitialProps } = initialProps

    // 生成画布组件Schema数据
    const componentSchema = {
      id: getUUID(),
      type,
      category,
      props: restInitialProps
    }

    schema.components.push(componentSchema)

    const componentDef = store.getComponentByType(componentSchema.type, componentSchema.category)

    componentDef.id = componentSchema.id

    // 更新当前选中组件
    store.updateComponent(componentDef)
  }

  return { handleDragStart, handleDrop }
}
