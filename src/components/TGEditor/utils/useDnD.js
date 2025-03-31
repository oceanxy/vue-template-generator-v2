export const useDnD = (schema, store) => {
  const handleDragStart = (e, component) => {
    // 区分内部拖拽和外部拖拽
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: component.id ? 'MOVE' : 'ADD',
      data: component
    }))
  }

  const handleDrop = (e, insertIndex) => {
    e.preventDefault()
    e.stopPropagation()

    // 索引有效性验证
    if (insertIndex === -1) {
      insertIndex = schema.components.length
    }

    const raw = e.dataTransfer.getData('application/json')
    if (!raw) return

    const { type, data } = JSON.parse(raw)

    // 修复插入位置判断
    const safeIndex = Math.max(0, Math.min(insertIndex, schema.components.length))

    if (type === 'ADD') {
      const componentSchema = store.createComponent(data)
      schema.components.splice(safeIndex, 0, componentSchema)

      return componentSchema
    } else if (type === 'MOVE') {
      const currentIndex = schema.components.findIndex(c => c.id === data.id)

      if (currentIndex !== -1) {
        const [moved] = schema.components.splice(currentIndex, 1)
        schema.components.splice(safeIndex, 0, moved)

        return moved
      }
    }

    return null
  }

  return { handleDragStart, handleDrop }
}
