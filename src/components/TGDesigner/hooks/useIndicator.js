import { Geometry } from '../utils/geometry'
import { useEditorStore } from '../stores/useEditorStore'
import { computed } from 'vue'

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
      COMPONENT_AREA: 30,
      CONTAINER: 30
    },
    EDGE: {
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
    const { dropContainer, isInsideLayoutContainer } = Geometry.findDropContainer(e, componentSchemas.value) || {
      isInsideLayoutContainer: false,
      dropContainer: containerRef.value
    }

    const containerType = isInsideLayoutContainer ? 'layout' : 'canvas'
    const layoutDirection = containerType === 'layout'
      ? getLayoutDirection(dropContainer)
      : 'vertical'

    // 更新可以确定的指示线信息
    store.$patch({
      indicator: {
        type: 'none', // 现在还不能确定该属性，为了避免以前的值影响目前的状态显示，必须强制清空
        containerType,
        layoutDirection,
        nestedLevel: parseInt(Geometry.calculateNestedLevel(dropContainer))
      }
    })

    // 获取可见子元素
    const children = Geometry.getValidChildren(dropContainer.children)

    // 空容器处理
    if (!children.length) {
      handleContainerIndicator(dropContainer, isInsideLayoutContainer)
    } else {
      // 计算相对位置
      const containerRect = dropContainer.getBoundingClientRect()
      const scrollTop = dropContainer.scrollTop
      let mouseY = e.clientY - containerRect.top + scrollTop

      if (Geometry.isInsideAnyComponent(mouseY, children, containerRect, scrollTop)) {
        // 处理组件内部拖拽
        handleComponentDrag(e, dropContainer, children, containerRect)
      } else {
        // 处理容器拖拽
        handleContainerDrag(e, dropContainer, children, containerRect, layoutDirection)
      }
    }
  }

  /**
   * 处理组件内部拖拽
   * @param e
   * @param container
   * @param {HTMLElement[]} children
   * @param containerRect
   */
  const handleComponentDrag = (e, container, children, containerRect) => {
    // 检查是否是布局组件的布局容器内部
    if (indicator.value.containerType === 'layout') {
      const direction = getLayoutDirection(container)
      children = Geometry.getValidChildren(container.children)

      // 处理布局组件中空的布局容器，直接显示容器指示线
      // if (!children?.length) {
      //   handleContainerIndicator(deepestContainer, true)
      // } else {
      containerRect = container.getBoundingClientRect()
      handleContainerDrag(e, container, children, containerRect, direction)
      // }
    } else {
      handlePlaceholderIndicator(e, container, containerRect, children)
    }
  }

  /**
   * 处理容器边缘拖拽
   * @param e
   * @param container
   * @param {HTMLElement[]} children
   * @param containerRect
   * @param direction
   */
  const handleContainerDrag = (e, container, children, containerRect, direction) => {
    const adjustedPosition = Geometry.getAdjustedPosition(e, container, containerRect, direction)
    const isInsideLayoutContainer = indicator.value.containerType === 'layout'
    const isEdgeTriggered = Geometry.checkDragEdgeThreshold(
      containerRect,
      container.scrollTop,
      direction,
      adjustedPosition,
      children,
      CONFIG,
      isInsideLayoutContainer
    )

    // 容器边界检测（当前容器内鼠标离最近的组件是否超过阈值）
    // 超过阈值则显示布局容器的容器指示线，否则显示容器的占位指示线
    if (isEdgeTriggered) {
      handlePlaceholderIndicator(e, container, containerRect, children, direction)
    } else {
      handleContainerIndicator(container, isInsideLayoutContainer)
    }
  }

  /**
   * 获取布局组件当前布局容器的布局方向
   * @param container {HTMLElement}
   * @returns {'horizontal' | 'vertical'}
   */
  function getLayoutDirection(container) {
    if (!container.classList.contains('tg-designer-layout-container')) return 'vertical'

    const style = window.getComputedStyle(container)
    return style.flexDirection.startsWith('row') ? 'horizontal' : 'vertical'
  }

  /**
   * 处理容器指示器
   * @param container
   * @param isInsideLayoutContainer
   */
  const handleContainerIndicator = (container, isInsideLayoutContainer) => {
    // 新增层级有效性检查
    const currentLevel = container.closest('.tg-designer-layout-component')?.dataset.nestedLevel || 1
    const draggingLevel = indicator.value?.nestedLevel || 1

    if (currentLevel > draggingLevel) return // 不显示深层容器指示线

    // 使用offset相关属性
    let relativePosition
    const containerRect = container.getBoundingClientRect()

    if (isInsideLayoutContainer) {
      const canvasContainer = container.closest('.tg-designer-canvas-container')
      const canvasRect = canvasContainer.getBoundingClientRect()

      relativePosition = {
        // 转换为相对于canvas容器的坐标
        top: containerRect.top - canvasRect.top + canvasContainer.scrollTop,
        left: containerRect.left - canvasRect.left + canvasContainer.scrollLeft,
        width: containerRect.width,
        height: containerRect.height
      }
    } else {
      const containerStyle = window.getComputedStyle(container)
      const padding = {
        top: parseFloat(containerStyle.paddingTop),
        right: parseFloat(containerStyle.paddingRight),
        bottom: parseFloat(containerStyle.paddingBottom),
        left: parseFloat(containerStyle.paddingLeft)
      }

      relativePosition = {
        top: container.offsetTop,
        left: container.offsetLeft,
        width: containerRect.width - padding.left - padding.right,
        height: containerRect.height - padding.top - padding.bottom
      }
    }

    store.$patch({
      indicator: {
        ...relativePosition,
        type: 'container',
        lastValidIndex: -1,
        display: 'block',
        layoutDirection: 'vertical'
      }
    })
  }

  /**
   * 处理占位符指示器
   * @param e {MouseEvent}
   * @param container {HTMLElement} - 当前直接父容器（可能是画布容器或布局容器）
   * @param containerRect {Object} - 布局容器的矩形信息
   * @param {HTMLElement[]} children - 当前容器中的可见子元素
   * @param [direction='vertical'] {string} - 当前容器的布局方向
   */
  const handlePlaceholderIndicator = (e, container, containerRect, children, direction = 'vertical') => {
    children = Array.from(children).filter(el => el.classList.contains('tg-designer-drag-component'))
    // 获取画布容器作为坐标基准
    const canvasContainer = container.closest('.tg-designer-canvas-container')
    const canvasRect = canvasContainer.getBoundingClientRect()

    // 计算容器相对画布的精确偏移量（包含滚动）
    const containerCanvasRect = container.getBoundingClientRect()
    const containerOffset = {
      left: containerCanvasRect.left - canvasRect.left + canvasContainer.scrollLeft,
      top: containerCanvasRect.top - canvasRect.top + canvasContainer.scrollTop
    }

    // 获取容器内边距
    const containerStyle = window.getComputedStyle(container)
    const padding = {
      top: parseFloat(containerStyle.paddingTop),
      right: parseFloat(containerStyle.paddingRight),
      bottom: parseFloat(containerStyle.paddingBottom),
      left: parseFloat(containerStyle.paddingLeft)
    }

    // 计算调整后的鼠标位置（基于当前容器坐标系）
    const adjustedPosition = Geometry.getAdjustedPosition(e, container, containerRect, direction)
    // 计算中间点并确定插入位置
    const midPoints = Geometry.calculateCompMidPoints(containerRect, children, direction, container.scrollTop)
    const insertIndex = Geometry.determineInsertIndex(adjustedPosition, midPoints)

    // 根据布局方向计算指示线参数
    let top = 0
    let left = 0
    let width = 0
    let height = 0
    const componentPosition = Geometry.calculateComponentPosition(
      insertIndex,
      children,
      adjustedPosition,
      midPoints,
      {
        ...CONFIG,
        direction,
        gap: parseFloat(containerStyle.gap)
      }
    )

    if (direction === 'horizontal') {
      // 转换为画布坐标系
      left = componentPosition + containerOffset.left
      top = containerOffset.top + padding.top
      width = '2px'
      height = containerRect.height - padding.top - padding.bottom
    } else {
      // 转换为画布绝对坐标（需包含容器偏移）
      top = componentPosition + containerOffset.top
      left = containerOffset.left + padding.left
      width = containerRect.width - padding.left - padding.right
      height = '2px'
    }

    store.$patch({
      indicator: {
        type: 'placeholder',
        display: 'block',
        lastValidIndex: insertIndex,
        top,
        left,
        width,
        height
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
        top: 0,
        left: 0,
        layoutDirection: 'vertical',
        containerType: 'canvas'
      }
    })
  }

  return {
    updateIndicator,
    resetIndicator
  }
}
