import { computed, ref } from 'vue'
import { useEditorStore } from '../stores/useEditorStore'
import useIndicator from '../hooks/useIndicator'
import { Geometry } from '@/components/TGEditor/utils/geometry'

/**
 * 拖拽处理逻辑 Hook
 * @returns {{
 *   handleDragStart: Function,
 *   handleDragOver: Function,
 *   handleDrop: Function,
 *   handleDragEnd: Function,
 *   handleDragLeave: Function
 * }}
 */
export default function useDragDrop() {
  const store = useEditorStore()
  const schema = computed(() => store.schema)
  const componentSchemas = computed(() => schema.value.components)
  const indicator = computed(() => store.indicator)
  const rafId = ref(null)
  const { resetIndicator, updateIndicator } = useIndicator()

  /**
   * 处理拖拽开始事件
   * @param {DragEvent} e
   * @param {Object} componentSchema
   */
  const handleDragStart = (e, componentSchema) => {
    store.selectedComponent = null

    e.dataTransfer.effectAllowed = componentSchema.id ? 'move' : 'copy'
    e.dataTransfer.setData('text/plain', componentSchema.id)
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: componentSchema.id ? 'MOVE' : 'ADD',
      data: componentSchema
    }))

    e.currentTarget.classList.add('dragging')
  }

  /**
   * 处理拖拽结束事件
   * @param {DragEvent} e
   */
  const handleDragEnd = (e) => {
    e.stopPropagation()
    e.currentTarget.classList.remove('dragging')

    // 强制终止所有进行中的动画帧
    if (rafId.value) {
      cancelAnimationFrame(rafId.value)
      rafId.value = null
    }

    resetIndicator()

    setTimeout(() => {
      // 清理所有拖拽状态
      document.querySelectorAll('.tg-editor-canvas-container .dragging').forEach(el => {
        el.classList.remove('dragging')
      })
    }, 50)
  }

  /**
   * 节流处理的拖拽悬停事件
   * @param {DragEvent} e
   * @param containerRef
   * @param indicatorRef
   */
  const handleDragOver = (e, containerRef, indicatorRef) => {
    e.preventDefault()

    if (rafId.value) return

    rafId.value = requestAnimationFrame(() => {
      updateIndicator(e, containerRef, indicatorRef)
      rafId.value = null
    })
  }

  /**
   * 处理放置事件
   * @param {DragEvent} e
   * @param containerRef
   */
  const handleDrop = (e, containerRef) => {
    e.preventDefault()
    let insertIndex = indicator.value.lastValidIndex

    // 1. 获取有效的父级容器信息
    const dropResult = Geometry.findDropContainer(e, componentSchemas.value) || {
      parentSchema: componentSchemas.value, // 默认使用根schema
      containerEl: containerRef.value
    }
    const { parentSchema, containerEl } = dropResult

    // 2. 计算相对于容器的位置
    const containerRect = containerEl.getBoundingClientRect()
    const mouseY = e.clientY - containerRect.top + containerEl.scrollTop

    // 3. 获取容器内可见子元素
    const children = Array.from(containerEl.children)
      .filter(el => el.classList.contains('tg-editor-canvas-component'))
      .filter(el => !el.classList.contains('dragging')) // 排除正在拖动的元素

    // 4. 计算中间点（基于实际容器）
    const midPoints = Geometry.calculateMidPoints(
      containerEl,
      children,
      containerEl.scrollTop
    )

    // 5. 确定插入位置（相对当前容器）
    insertIndex = Geometry.determineInsertIndex(mouseY, midPoints)
    insertIndex = Math.max(0, Math.min(insertIndex, parentSchema.length))

    // 6. 处理数据转换
    const raw = e.dataTransfer.getData('application/json')
    if (!raw) return
    const { type, data } = JSON.parse(raw)

    // 7. 执行插入/移动操作
    let componentSchema = null
    const safeIndex = Math.max(0, Math.min(insertIndex, parentSchema.length))

    if (type === 'ADD') {
      componentSchema = store.createComponentSchema(data)
      parentSchema.splice(safeIndex, 0, componentSchema) // 插入到父级schema
    } else if (type === 'MOVE') {
      // 查找原始位置（支持跨容器移动）
      const findInSchema = (schemaArray, id) => {
        for (let i = 0; i < schemaArray.length; i++) {
          if (schemaArray[i].id === id) return { parent: schemaArray, index: i }
          if (schemaArray[i].children) {
            const found = findInSchema(schemaArray[i].children, id)
            if (found) return found
          }
        }
        return null
      }

      const origin = findInSchema(componentSchemas.value, data.id)
      if (!origin) return

      // 执行移动
      const [moved] = origin.parent.splice(origin.index, 1)

      // 调整插入位置（当向前移动时补偿索引）
      let adjustedIndex = safeIndex
      if (origin.parent === parentSchema && origin.index < adjustedIndex) {
        adjustedIndex--
      }

      parentSchema.splice(adjustedIndex, 0, moved)
      componentSchema = moved
    }

    // 8. 清理状态
    if (rafId.value) {
      cancelAnimationFrame(rafId.value)
      rafId.value = null
    }
    resetIndicator()

    // 9. 更新选中状态
    if (componentSchema) {
      store.updateComponent(componentSchema)
    }
  }

  /**
   * 处理拖拽离开事件
   * @param {DragEvent} e
   */
  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (rafId.value) {
        cancelAnimationFrame(rafId.value)
        rafId.value = null
      }

      resetIndicator()
    }
  }

  return {
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleDragLeave
  }
}
