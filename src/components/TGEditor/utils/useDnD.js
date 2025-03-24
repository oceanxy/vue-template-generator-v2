import { getUUID } from '@/utils/utilityFunction'
import { toRaw } from 'vue'
import { message } from 'ant-design-vue'

export const useDnD = (schema, store) => {
  const createComponent = e => {
    const componentType = e.dataTransfer.getData('componentType')
    const initialProps = JSON.parse(e.dataTransfer.getData('initialProps'))
    const { category, ...restInitialProps } = initialProps

    return {
      id: getUUID(),
      type: componentType,
      category,
      props: restInitialProps
    }
  }

  const validateComponentPosition = (oldIndex, targetIndex, listLength) => {
    return (
      oldIndex >= 0 &&
      targetIndex >= 0 &&
      oldIndex < listLength &&
      targetIndex < listLength
    )
  }

  const handleDragStart = (e, component) => {
    // 携带组件类型和初始props
    e.dataTransfer.setData('componentType', component.type)
    e.dataTransfer.setData('initialProps', JSON.stringify({
      ...component.defaultProps,
      style: component.style,
      category: component.category
    }))
  }

  const handleDrop = e => {
    e.preventDefault()
    e.stopPropagation()

    const handleNewComponent = (e, schema) => {
      const newComponent = createComponent(e)
      const { nearestElement, lastDirection } = store

      // 无目标位置时追加
      if (!nearestElement || !lastDirection) {
        schema.components.push(newComponent)
        return true
      }

      // 查找目标位置
      const targetId = nearestElement.dataset.id
      const targetIndex = schema.components.findIndex(c => c.id === targetId)
      if (targetIndex === -1) return false

      // 计算插入位置
      const insertIndex = lastDirection === 'top'
        ? targetIndex
        : targetIndex + 1

      schema.components.splice(insertIndex, 0, newComponent)
      store.updateComponent(newComponent)
      return true
    }

    const handleSortComponent = (draggedId, schema) => {
      const { nearestElement, lastDirection } = store
      if (!nearestElement || !lastDirection) return false

      // 获取原始数据
      const rawComponents = toRaw(schema.components)
      const targetId = nearestElement.dataset.id

      // 查找索引
      const oldIndex = rawComponents.findIndex(c => c.id === draggedId)
      const targetIndex = rawComponents.findIndex(c => c.id === targetId)

      // 边界校验
      if (
        oldIndex === -1 ||
        targetIndex === -1 ||
        oldIndex === targetIndex
      ) {
        return false
      }

      // 计算修正后的新索引
      let newIndex = lastDirection === 'top' ? targetIndex : targetIndex + 1
      newIndex = newIndex > oldIndex ? newIndex - 1 : newIndex

      // 创建新数组（触发响应式更新）
      const newComponents = [...rawComponents]
      const [movedItem] = newComponents.splice(oldIndex, 1)
      newComponents.splice(newIndex, 0, movedItem)

      // 批量更新（减少响应式触发次数）
      schema.components.splice(0, schema.components.length, ...newComponents)
      return true
    }

    try {
      const draggedId = e.dataTransfer.getData('text/plain')
      const isExisting = schema.components.some(c => c.id === draggedId)

      // 分流处理逻辑
      const success = isExisting
        ? handleSortComponent(draggedId, schema)
        : handleNewComponent(e, schema)

      // 统一状态清理
      store.clearIndicator()
      if (!success) message.warning('组件位置未发生变化')
    } catch (error) {
      console.error('拖放处理失败:', error)
      message.error('组件操作失败，请检查控制台')
    }
  }

  return { handleDragStart, handleDrop }
}
