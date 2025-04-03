import { computed, ref } from 'vue'
import { useEditorStore } from '../stores/useEditorStore'
import useIndicator from '../hooks/useIndicator'

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
   */
  const handleDrop = (e) => {
    let insertIndex = indicator.value.lastValidIndex

    if (indicator.value.type === 'container') {
      insertIndex = componentSchemas.value.length
    }

    insertIndex = Math.max(0, Math.min(insertIndex, componentSchemas.value.length))

    let componentSchema = null

    // 索引有效性验证
    if (insertIndex === -1) {
      insertIndex = componentSchemas.value.length
    }

    const raw = e.dataTransfer.getData('application/json')
    if (!raw) return

    const { type, data } = JSON.parse(raw)

    // 修复插入位置判断
    const safeIndex = Math.max(0, Math.min(insertIndex, componentSchemas.value.length))

    if (type === 'ADD') {
      componentSchema = store.createComponentSchema(data)
      store.schema.components.splice(safeIndex, 0, componentSchema)
    } else if (type === 'MOVE') {
      const currentIndex = componentSchemas.value.findIndex(c => c.id === data.id)

      if (currentIndex !== -1) {
        let adjustedIndex = insertIndex

        // 当元素从前往后移动时，需要减1补偿索引
        if (currentIndex < adjustedIndex) {
          adjustedIndex--
        }

        const [moved] = store.schema.components.splice(currentIndex, 1)
        store.schema.components.splice(adjustedIndex, 0, moved)

        componentSchema = moved
      }
    }

    if (rafId.value) {
      cancelAnimationFrame(rafId.value)
      rafId.value = null
    }

    resetIndicator()

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
