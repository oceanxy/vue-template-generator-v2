import { computed, ref } from 'vue'
import { useEditorStore } from '../stores/useEditorStore'
import useIndicator from '../hooks/useIndicator'
import { Geometry } from '@/components/TGDesigner/utils/geometry'

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
  const indicator = computed(() => store.indicator)
  const componentSchemas = computed(() => schema.value.components)
  const rafId = ref(null)
  const { resetIndicator, updateIndicator } = useIndicator()

  /**
   * 处理拖拽开始事件
   * @param {DragEvent} e
   * @param {Object} componentSchema
   */
  const handleDragStart = (e, componentSchema) => {
    if (componentSchema.__animating) {
      e.preventDefault()
      return
    }

    store.selectedComponent = null

    const dragData = JSON.stringify({
      id: componentSchema.id,
      type: componentSchema.id ? 'MOVE' : 'ADD',
      data: componentSchema
    })

    e.dataTransfer.setData('application/json', dragData)
    // Safari需要纯文本格式
    e.dataTransfer.setData('text/plain', dragData)

    e.dataTransfer.effectAllowed = componentSchema.id ? 'move' : 'copy'
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
      document.querySelectorAll('.tg-designer-canvas-container .dragging').forEach(el => {
        el.classList.remove('dragging')
      })
    }, 50)
  }

  /**
   * 节流处理的拖拽悬停事件
   * @param {DragEvent} e
   * @param containerRef
   */
  const handleDragOver = (e, containerRef) => {
    e.preventDefault()

    // Safari需要明确的dropEffect
    if (e.dataTransfer) {
      try {
        e.dataTransfer.dropEffect = 'copy'
      } catch (error) {
        // Safari可能会抛出异常，忽略即可
      }
    }

    if (rafId.value) return

    rafId.value = requestAnimationFrame(() => {
      updateIndicator(e, containerRef)
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

    // 处理数据转换
    const raw = e.dataTransfer.getData('application/json') ||
      e.dataTransfer.getData('text/plain') // Safari数据获取兼容

    if (!raw) return

    const { type, data } = JSON.parse(raw)

    // 获取有效的父级容器信息
    const {
      dropContainer,
      schema,
      parentId
    } = Geometry.findDropContainer(e, componentSchemas.value) || {
      parentSchema: componentSchemas.value, // 默认使用根schema
      dropContainer: containerRef.value,
      parentId: null
    }

    // 获取Grid布局组件内当前布局容器的信息
    let cellPosition = dropContainer.dataset?.cellPosition
    const isCell = dropContainer.classList?.contains('tg-designer-layout-container') && cellPosition
    // 确定插入位置（相对当前容器）
    let insertIndex = 0

    if (!isCell) {
      if (store.indicator.type === 'container') {
        // 当显示容器指示线时，强制插入到末尾
        insertIndex = schema.length
      } else {
        // 计算相对于容器的位置
        const containerRect = dropContainer.getBoundingClientRect()
        const direction = indicator.value.layoutDirection
        const mousePosition = direction === 'horizontal'
          ? e.clientX - containerRect.left
          : e.clientY - containerRect.top + dropContainer.scrollTop
        // 获取容器内可见子元素
        const children = Geometry.getValidChildren(dropContainer.children).valid
        // 计算中间点（基于实际容器）
        const midPoints = Geometry.calculateCompMidPoints(
          containerRect,
          children,
          indicator.value.layoutDirection,
          dropContainer.scrollTop
        )
        // 原有计算逻辑
        insertIndex = Math.max(
          0,
          Math.min(
            Geometry.determineInsertIndex(mousePosition, midPoints),
            schema.length
          )
        )
      }
    }

    // 执行插入/移动操作
    let componentSchema = null

    function insertOrReplace(insertIndex, componentSchema) {
      // 插入到父级schema
      if (isCell) {
        // Grid容器插入时要检测该单元格是否已存在组件，存在则替换，反之则插入
        const index = schema.findIndex(item => item.cellPosition === cellPosition)

        if (index > -1) {
          schema.splice(index, 1, componentSchema)
        } else {
          schema.splice(insertIndex, 0, componentSchema)
        }
      } else {
        // Flex容器直接插入
        schema.splice(insertIndex, 0, componentSchema)
      }
    }

    if (type === 'ADD') {
      componentSchema = store.createComponentSchema(data, parentId, cellPosition)
      insertOrReplace(insertIndex, componentSchema)
    } else if (type === 'MOVE') {
      /**
       * 查找原始位置（支持跨容器移动）
       * @param schemaArray
       * @param id
       * @returns {{parent, index: number}|*|null}
       */
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
      moved.parentId = parentId
      // 更新在Grid布局组件内移动元素的位置信息
      moved.cellPosition = isCell ? cellPosition : undefined

      // 当向前移动时补偿索引
      // 仅当在同一个父容器内移动时才需要补偿
      if (origin.parent === schema) {
        // 当拖动元素在插入位置之后时才需要补偿
        if (origin.index < insertIndex) {
          insertIndex = insertIndex--
        }
      }

      // 双端约束防止越界
      insertIndex = Math.max(0, Math.min(insertIndex, schema.length))
      insertOrReplace(insertIndex, moved)
      componentSchema = moved
    }

    // 清理状态
    if (rafId.value) {
      cancelAnimationFrame(rafId.value)
      rafId.value = null
    }
    resetIndicator()

    // 更新选中状态
    if (componentSchema) {
      store.updateComponent(componentSchema)
    }

    setTimeout(() => {
      // 递归标记组件状态
      schema[insertIndex] = {
        ...schema[insertIndex],
        __initialized: true,
        __animating: false
      }
    }, 200) // 精确匹配动画时长
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
