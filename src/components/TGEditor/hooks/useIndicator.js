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
   */
  const updateIndicator = (e, containerRef) => {
    if (!containerRef.value) return

    // 确定拖拽容器类型
    const dropResult = Geometry.findDropContainer(e, componentSchemas.value) || {
      inValidLayoutArea: false,
      containerEl: containerRef.value,
      parentSchema: componentSchemas.value
    }

    // 更新validArea状态
    store.$patch({
      indicator: {
        ...store.indicator,
        validArea: dropResult.inValidLayoutArea ? 'layout-container' : 'default'
      }
    })

    // 根据validArea选择目标容器
    const currentContainer = (() => {
      if (store.indicator.validArea === 'layout-container') {
        return dropResult.containerEl.querySelector('.tg-editor-drag-placeholder-within-layout') ||
          dropResult.containerEl
      }

      // 查找最近的合法父容器
      let parentContainer = dropResult.containerEl
      while (parentContainer &&
      !parentContainer.classList.contains('tg-editor-canvas-container') &&
      !parentContainer.classList.contains('tg-editor-layout-component')) {
        parentContainer = parentContainer.parentElement
      }
      return parentContainer || containerRef.value
    })()

    // 计算相对位置
    const containerRect = currentContainer.getBoundingClientRect()
    const scrollTop = currentContainer.scrollTop
    let mouseY = e.clientY - containerRect.top + scrollTop

    // 容器边界处理
    if (store.indicator.validArea === 'default') {
      const parentContainer = currentContainer.closest('.tg-editor-drag-placeholder-within-layout')

      if (parentContainer) {
        const parentRect = parentContainer.getBoundingClientRect()

        mouseY = Math.max(
          parentRect.top - containerRect.top,
          Math.min(
            mouseY,
            parentRect.bottom - containerRect.top
          )
        )
      }
    }

    // 获取可见子元素
    const children = (() => {
      if (store.indicator.validArea === 'layout-container') {
        return Array.from(currentContainer.children)
          .filter(el => el.classList.contains('tg-editor-drag-component'))
      }

      return Array.from(currentContainer.children)
        .filter(el => el.classList.contains('tg-editor-drag-component'))
        .filter(el => !el.classList.contains('dragging'))
    })()

    // 空容器处理
    if (children.length === 0) {
      return handleEmptyCanvas(currentContainer)
    }

    if (Geometry.isInsideAnyComponent(mouseY, children, currentContainer)) {
      // 处理组件内部拖拽
      handleComponentDrag(currentContainer, mouseY, children)
    } else {
      // 处理容器边缘拖拽
      handleContainerDrag(currentContainer, mouseY, children)
    }

    // 更新容器层级信息
    store.$patch({
      indicator: {
        ...store.indicator,
        nestedLevel: calculateNestedLevel(currentContainer)
      }
    })
  }

  const calculateNestedLevel = (element) => {
    if (!element) return 0

    return element.closest('.tg-editor-layout-component') ?
      element.closest('.tg-editor-layout-component').querySelectorAll('.tg-editor-layout-component').length : 0
  }

  /**
   * 处理空画布状态
   */
  const handleEmptyCanvas = container => {
    const isLayoutContainer = container.classList.contains('tg-editor-layout-component')

    store.$patch({
      indicator: {
        type: 'container',
        display: 'block',
        top: '50%',
        left: '50%',
        layoutDirection: null,
        containerType: isLayoutContainer ? 'layout' : 'canvas',
        validArea: 'default'
      }
    })
  }

  /**
   * 处理组件内部拖拽
   * @param container
   * @param {number} mouseY
   * @param {HTMLElement[]} children
   */
  const handleComponentDrag = (container, mouseY, children) => {
    if (Geometry.isInsideAnyComponent(mouseY, children, container)) {
      handlePlaceholderIndicator(container, mouseY, children)
      return
    }

    // 滚动偏移补偿
    const scrollTop = container.scrollTop
    const adjustedMouseY = mouseY

    const midPoints = Geometry.calculateMidPoints(container, children, scrollTop)
    const insertIndex = Geometry.determineInsertIndex(adjustedMouseY, midPoints)

    // 容器边界检测
    if (insertIndex === 0 && adjustedMouseY < children[0].offsetTop - CONFIG.THRESHOLD.CONTAINER) {
      return handleContainerIndicator(container, adjustedMouseY)
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
   * @param container
   * @param {number} mouseY
   * @param {HTMLElement[]} children
   */
  const handleContainerDrag = (container, mouseY, children) => {
    // 判断当前容器是否为布局组件
    const isLayoutContainer = container.classList?.contains('tg-editor-layout-component')

    // 边缘吸附检查
    const containerRect = container.getBoundingClientRect()
    const scrollTop = container.scrollTop
    const snappedPos = checkEdgeSnap(containerRect, scrollTop, mouseY, children, isLayoutContainer)

    if (snappedPos !== null) {
      store.$patch({
        indicator: {
          type: 'placeholder',
          top: `${snappedPos}px`,
          display: 'block',
          layoutDirection: isLayoutContainer ? getLayoutDirection(container) : null
        }
      })

      return
    }

    // 优先检查组件区域
    const isInsideComponent = Geometry.isInsideAnyComponent(
      mouseY,
      children,
      container
    )

    if (isInsideComponent) {
      return handleComponentDrag(container, mouseY, children)
    }

    // 动态阈值计算
    const dynamicThreshold = container.clientHeight * (isLayoutContainer
        ? 0.2 // 布局组件使用更大阈值
        : 0.15 // 画布内组件调整为容器高度的15%
    )

    // 处理布局组件内部指示线
    if (isLayoutContainer) {
      const cssSelector = '.tg-editor-drag-placeholder-within-layout'
      const layoutChildren = Array.from(container.querySelector(cssSelector)?.children || [])
      const layoutMidPoints = Geometry.calculateMidPoints(
        container,
        layoutChildren,
        container.scrollTop
      )

      if (layoutChildren.length > 0) {
        const insertIndex = Geometry.determineInsertIndex(mouseY, layoutMidPoints)
        const minDistance = Math.min(
          Math.abs(mouseY - (layoutMidPoints[insertIndex - 1] || 0)),
          Math.abs(mouseY - (layoutMidPoints[insertIndex] || 0))
        )

        if (minDistance < dynamicThreshold) {
          return handlePlaceholderIndicator(container, mouseY, layoutChildren, true)
        }
      }
    }

    const minDistance = calculateMinDistance(mouseY, children, container)

    // 调整判断条件
    if (minDistance > dynamicThreshold) {
      handleContainerIndicator(container, mouseY)
    } else {
      handlePlaceholderIndicator(container, mouseY, children)
    }
  }

  function getLayoutDirection(container) {
    const style = window.getComputedStyle(container)
    return style.flexDirection === 'column' ? 'vertical' : 'horizontal'
  }

  /**
   * 边缘吸附检查
   * @param containerRect
   * @param scrollTop
   * @param {number} mouseY
   * @param {HTMLElement[]} children
   * @param [isLayoutContainer] {boolean}
   * @returns {number|null}
   */
  const checkEdgeSnap = (containerRect, scrollTop, mouseY, children, isLayoutContainer = false) => {
    // 新增布局方向判断
    const layoutDirection = isLayoutContainer ?
      getLayoutDirection(containerRect.element) :
      'vertical'

    // 修改：同时检查水平和垂直方向
    for (const child of children) {
      const childRect = child.getBoundingClientRect()
      let actualEdges = {}

      // 判断是否是嵌套布局的容器元素
      const isNestedContainer = child.classList.contains('tg-editor-drag-placeholder-within-layout')

      if (isLayoutContainer && isNestedContainer) {
        // 处理嵌套布局容器的坐标转换
        const layoutContainerRect = child.getBoundingClientRect()
        actualEdges = {
          start: layoutContainerRect.left - containerRect.left + scrollTop,
          end: layoutContainerRect.right - containerRect.left + scrollTop
        }
      } else {
        // 根据布局方向计算实际边缘位置
        actualEdges = layoutDirection === 'horizontal' ? {
          start: childRect.left - containerRect.left + scrollTop,
          end: childRect.right - containerRect.left + scrollTop
        } : {
          start: childRect.top - containerRect.top + scrollTop,
          end: childRect.bottom - containerRect.top + scrollTop
        }
      }

      // 检查起始边缘吸附（左/上边缘）
      if (Math.abs(actualEdges.start - mouseY) < CONFIG.EDGE.SNAP_RANGE) {
        return actualEdges.start
      }

      // 检查结束边缘吸附（右/下边缘）
      if (Math.abs(actualEdges.end - mouseY) < CONFIG.EDGE.SNAP_RANGE) {
        return actualEdges.end
      }

      // 检查布局容器内部空白区域
      if (isLayoutContainer && child.children.length === 0) {
        const centerPos = (actualEdges.start + actualEdges.end) / 2
        if (Math.abs(centerPos - mouseY) < CONFIG.EDGE.SNAP_RANGE * 2) {
          return centerPos
        }
      }
    }

    // 检查容器自身边缘（仅限布局容器）
    if (isLayoutContainer) {
      const containerCenterY = containerRect.height / 2
      if (Math.abs(containerCenterY - mouseY) < CONFIG.EDGE.SNAP_RANGE * 2) {
        return containerCenterY
      }
    }

    return null
  }

  /**
   * 计算最小距离
   * @param {number} mouseY
   * @param {HTMLElement[]} children
   * @param container
   * @returns {number}
   */
  const calculateMinDistance = (mouseY, children, container) => {
    if (children.length === 0) return Infinity

    const containerRect = container.getBoundingClientRect()
    const scrollTop = container.scrollTop

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
   * @param container
   * @param mouseY
   */
  const handleContainerIndicator = (container, mouseY) => {
    const isLayoutContainer = container.classList?.contains('tg-editor-layout-component')
    const paddingTop = parseStyleValue(
      schema.value.canvas.style?.paddingTop || '15px'
    )
    const paddingBottom = parseStyleValue(
      schema.value.canvas.style?.paddingBottom || '15px'
    )

    const isTop = mouseY < container.scrollHeight / 2
    const position = isTop
      ? paddingTop
      : container.scrollHeight - paddingBottom

    store.$patch({
      indicator: {
        ...indicator.value,
        type: 'container',
        lastValidIndex: -1,
        top: `${position}px`,
        left: '0px',
        display: 'block',
        layoutDirection: null,
        containerType: isLayoutContainer ? 'layout' : 'canvas'
      }
    })
  }

  /**
   * 处理占位符指示器
   * @param container
   * @param {number} mouseY
   * @param {HTMLElement[]} children
   * @param [isNested]
   */
  const handlePlaceholderIndicator = (container, mouseY, children, isNested = false) => {
    // 处理嵌套容器的方向
    const layoutDirection = isNested ?
      getLayoutDirection(container.closest('.tg-editor-layout-container')) :
      null

    const midPoints = Geometry.calculateMidPoints(container, children, container.scrollTop)
    const insertIndex = Geometry.determineInsertIndex(mouseY, midPoints)

    // 根据布局方向调整位置计算
    let targetPos
    let orientation
    if (layoutDirection === 'vertical') {
      const child = children[insertIndex]
      targetPos = child ? child.offsetTop : 0
      orientation = 'horizontal'
    } else {
      // 原有水平布局计算逻辑
      targetPos = calculateComponentPosition(insertIndex, children, mouseY, midPoints)
      orientation = 'vertical'
    }

    store.$patch({
      indicator: {
        ...indicator.value,
        type: 'placeholder',
        lastValidIndex: insertIndex,
        top: `${targetPos}px`,
        left: '0px',
        display: 'block',
        layoutDirection: orientation,
        containerType: isNested ? 'layout' : 'canvas'
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
        top: '0px',
        left: '0px',
        layoutDirection: null,
        containerType: 'canvas'
      }
    })
  }

  return {
    updateIndicator,
    resetIndicator
  }
}
