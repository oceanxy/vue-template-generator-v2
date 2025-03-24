import { getUUID } from '@/utils/utilityFunction'
import { useDraggable } from '@vueuse/core'

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

  const handleDrop = e => {
    // 生成画布组件Schema数据
    const newComponent = createComponent(e)

    // 在插入逻辑前添加边界判断
    if (!store.nearestElement || !store.lastDirection) {
      schema.components.push(newComponent)
      return
    }

    const targetId = store.nearestElement.dataset.id
    const targetIndex = schema.components.findIndex(c => c.id === targetId)

    if (targetIndex === -1) {
      schema.components.push(newComponent)
      return
    }

    // 修正插入位置计算
    const insertIndex = store.lastDirection === 'top'
      // 插入到当前组件前面
      ? targetIndex
      // 插入到当前组件后面
      : targetIndex + 1

    schema.components.splice(insertIndex, 0, newComponent)

    // 清除指示线
    store.clearIndicator()
    // 更新当前选中组件
    store.updateComponent(newComponent)
  }

  return { handleDragStart, handleDrop }
}
