import { getUUID } from '@/utils/utilityFunction'

export const useDnD = (schema, store) => {
  const handleDragStart = (e, component) => {
    // 携带组件类型和初始props
    e.dataTransfer.setData('componentType', component.type)
    e.dataTransfer.setData('initialProps', JSON.stringify({
      ...component.defaultProps,
      style: component.style
    }))
  }

  const handleDrop = (e) => {
    const type = e.dataTransfer.getData('componentType')
    const initialProps = JSON.parse(e.dataTransfer.getData('initialProps'))

    // 生成画布组件数据
    schema.components.push({
      id: getUUID(),
      type,
      props: initialProps,
      style: {
        // margin: initialProps.style?.margin || '8px',
        // padding: initialProps.style?.padding || '12px'
      }
    })
  }

  return { handleDragStart, handleDrop }
}
