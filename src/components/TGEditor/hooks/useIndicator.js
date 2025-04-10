import { Geometry } from '../utils/geometry'
import { useEditorStore } from '../stores/useEditorStore'
import { computed } from 'vue'
import { parseStyleValue } from '../utils/style'

/**
 * 指示器逻辑 Hook
 * @returns {{
 *   updateIndicator: Function,
 *   resetIndicator: Function
 * }}
 */
export default function useIndicator() {
  const store = useEditorStore()
  const indicator = computed(() => store.indicator)
  const schema = computed(() => store.schema)
  const componentSchemas = computed(() => schema.value.components)

  // 配置常量
  const CONFIG = {
    THRESHOLD: {
      COMPONENT_AREA: 0,
      CONTAINER: 30
    },
    EDGE: {
      SNAP_RANGE: 5,
      OFFSET: 2
    }
  }

  /**
   * 核心位置计算逻辑
   * @param {DragEvent} e
   * @param containerRef
   * @param indicatorRef
   */
  const updateIndicator = (e, containerRef, indicatorRef) => {
    if (!containerRef.value) return

    const dropTarget = Geometry.findDropContainer(e, componentSchemas.value) || {
      containerEl: containerRef.value,
      parentSchema: componentSchemas.value
    }

    const isNested = dropTarget.containerEl !== containerRef.value
    indicatorRef.value?.setAttribute('data-nested', isNested)

    const containerRect = dropTarget.containerEl.getBoundingClientRect()
    const mouseY = e.clientY - containerRect.top + dropTarget.containerEl.scrollTop
    const children = getVisibleChildren(containerRef)

    // 空画布处理
    if (children.length === 0) {
      handleEmptyCanvas()
      return
    }

    // 优先处理组件内部拖拽
    if (Geometry.isInsideAnyComponent(mouseY, children, containerRef)) {
      handleComponentDrag(containerRef, mouseY, children)
      return
    }

    // 处理容器边缘拖拽
    handleContainerDrag(containerRef, mouseY, children)
  }

  /**
   * 获取可见子元素（带缓存）
   * @returns {HTMLElement[]}
   */
  const getVisibleChildren = (containerRef) => {
    return Array.from(containerRef.value?.children || [])
      .filter(el => el.classList.contains('tg-editor-canvas-component'))
  }

  /**
   * 处理空画布状态
   */
  const handleEmptyCanvas = () => {
    indicator.value.type = 'container'
    indicator.value.display = 'block'

    const paddingTop = parseStyleValue(
      schema.value.canvas.style?.paddingTop || '15px'
    )
    indicator.value.top = `${paddingTop}px`
  }

  /**
   * 处理组件内部拖拽
   * @param containerRef
   * @param {number} mouseY
   * @param {HTMLElement[]} children
   */
  const handleComponentDrag = (containerRef, mouseY, children) => {
    if (Geometry.isInsideAnyComponent(mouseY, children, containerRef)) {
      handlePlaceholderIndicator(containerRef, mouseY, children)
      return
    }

    // 滚动偏移补偿
    const scrollTop = containerRef.value.scrollTop
    const adjustedMouseY = mouseY

    const midPoints = Geometry.calculateMidPoints(containerRef.value, children, scrollTop)
    const insertIndex = Geometry.determineInsertIndex(adjustedMouseY, midPoints)

    // 容器边界检测
    if (insertIndex === 0 && adjustedMouseY < children[0].offsetTop - CONFIG.THRESHOLD.CONTAINER) {
      return handleContainerIndicator(containerRef, adjustedMouseY)
    }
  }

  /**
   * 计算组件间插入位置
   * @param {number} insertIndex
   * @param {HTMLElement[]} children
   * @param mouseY
   * @param {number[]} midPoints
   * @returns {number}
   */
  const calculateComponentPosition = (insertIndex, children, mouseY, midPoints) => {
    // 顶部边界处理
    if (insertIndex === 0 && midPoints.length > 0 && mouseY < midPoints[0] - CONFIG.THRESHOLD.CONTAINER) {
      return children[0].offsetTop - CONFIG.EDGE.OFFSET
    }

    // 常规位置计算
    if (insertIndex === 0) {
      return Math.max(CONFIG.EDGE.OFFSET, children[0].offsetTop - CONFIG.EDGE.OFFSET)
    }

    if (insertIndex === children.length) {
      const lastChild = children[children.length - 1]
      return lastChild.offsetTop + lastChild.offsetHeight + CONFIG.EDGE.OFFSET
    }

    const prevChild = children[insertIndex - 1]
    const nextChild = children[insertIndex]
    return (prevChild.offsetTop + prevChild.offsetHeight + nextChild.offsetTop) / 2
  }

  /**
   * 处理容器边缘拖拽
   * @param containerRef
   * @param {number} mouseY
   * @param {HTMLElement[]} children
   */
  const handleContainerDrag = (containerRef, mouseY, children) => {
    // 边缘吸附检查
    const containerRect = containerRef.value.getBoundingClientRect()
    const scrollTop = containerRef.value.scrollTop
    const snappedPos = checkEdgeSnap(containerRect, scrollTop, mouseY, children)
    if (snappedPos !== null) {
      store.$patch({
        indicator: {
          type: 'placeholder',
          top: `${snappedPos}px`,
          display: 'block'
        }
      })

      return
    }

    // 优先检查组件区域
    const isInsideComponent = Geometry.isInsideAnyComponent(
      mouseY,
      children,
      containerRef
    )

    if (isInsideComponent) {
      return handleComponentDrag(containerRef, mouseY, children)
    }

    // 动态阈值计算
    const dynamicThreshold = containerRef.value.clientHeight * 0.15 // 调整为容器高度的15%
    const minDistance = calculateMinDistance(mouseY, children, containerRef)

    // 调整判断条件
    if (minDistance > dynamicThreshold) {
      handleContainerIndicator(containerRef, mouseY)
    } else {
      handlePlaceholderIndicator(containerRef, mouseY, children)
    }
  }

  /**
   * 边缘吸附检查
   * @param containerRect
   * @param scrollTop
   * @param {number} mouseY
   * @param {HTMLElement[]} children
   * @returns {number|null}
   */
  const checkEdgeSnap = (containerRect, scrollTop, mouseY, children) => {
    for (const child of children) {
      const childRect = child.getBoundingClientRect()
      const actualChildTop = childRect.top - containerRect.top + scrollTop
      const actualChildBottom = childRect.bottom - containerRect.top + scrollTop

      if (Math.abs(actualChildTop - mouseY) < CONFIG.EDGE.SNAP_RANGE) {
        return actualChildTop
      }

      if (Math.abs(actualChildBottom - mouseY) < CONFIG.EDGE.SNAP_RANGE) {
        return actualChildBottom
      }
    }
    return null
  }

  /**
   * 计算最小距离
   * @param {number} mouseY
   * @param {HTMLElement[]} children
   * @param containerRef
   * @returns {number}
   */
  const calculateMinDistance = (mouseY, children, containerRef) => {
    if (children.length === 0) return Infinity

    const containerRect = containerRef.value.getBoundingClientRect()
    const scrollTop = containerRef.value.scrollTop

    return Math.min(...children.map(child => {
      const childRect = child.getBoundingClientRect()
      const topEdge = childRect.top - containerRect.top + scrollTop
      const bottomEdge = childRect.bottom - containerRect.top + scrollTop

      return Math.min(
        Math.abs(mouseY - topEdge),
        Math.abs(mouseY - bottomEdge)
      )
    }))
  }

  /**
   * 处理容器指示器
   * @param containerRef
   * @param mouseY
   */
  const handleContainerIndicator = (containerRef, mouseY) => {
    indicator.value.type = 'container'
    indicator.value.lastValidIndex = -1

    const paddingTop = parseStyleValue(
      schema.value.canvas.style?.paddingTop || '15px'
    )
    const paddingBottom = parseStyleValue(
      schema.value.canvas.style?.paddingBottom || '15px'
    )

    const isTop = mouseY < containerRef.value.scrollHeight / 2
    const position = isTop
      ? paddingTop
      : containerRef.value.scrollHeight - paddingBottom

    store.$patch({
      indicator: {
        top: `${position}px`,
        display: 'block'
      }
    })
  }

  /**
   * 处理占位符指示器
   * @param containerRef
   * @param {number} mouseY
   * @param {HTMLElement[]} children
   */
  const handlePlaceholderIndicator = (containerRef, mouseY, children) => {
    const midPoints = Geometry.calculateMidPoints(containerRef.value, children, containerRef.value.scrollTop)
    const insertIndex = Geometry.determineInsertIndex(mouseY, midPoints)
    const targetPos = calculateComponentPosition(insertIndex, children, mouseY, midPoints)

    store.$patch({
      indicator: {
        type: 'placeholder',
        lastValidIndex: insertIndex,
        top: `${targetPos}px`,
        display: 'block'
      }
    })
  }

  /**
   * 重置指示器状态
   */
  const resetIndicator = () => {
    store.$patch({
      indicator: {
        type: 'none',
        display: 'none',
        lastValidIndex: -1,
        top: '0px'
      }
    })
  }

  return {
    updateIndicator,
    resetIndicator
  }
}
