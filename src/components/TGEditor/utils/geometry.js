/**
 * 几何计算工具模块
 */

export const Geometry = {
  /**
   * 计算子元素中点坐标（相对于容器顶部）
   * @param {HTMLElement} container
   * @param {HTMLElement[]} elements
   * @param scrollTop
   * @returns {number[]}
   */
  calculateMidPoints(container, elements, scrollTop = 0) {
    return elements.map(el => {
      const rect = el.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      return (rect.top + rect.bottom) / 2 - containerRect.top + scrollTop
    })
  },

  /**
   * 使用二分查找确定插入位置
   * @param {number} target
   * @param {number[]} sortedArray
   * @returns {number}
   */
  determineInsertIndex(target, sortedArray) {
    let low = 0
    let high = sortedArray.length - 1
    while (low <= high) {
      const mid = (low + high) >>> 1
      if (target < sortedArray[mid]) {
        high = mid - 1
      } else {
        low = mid + 1
      }
    }
    return low
  },

  calculateValidPosition(mouseY, containerHeight) {
    const safeZone = containerHeight * 0.1 // 上下10%区域为容器指示区
    return mouseY < safeZone || mouseY > containerHeight - safeZone
  },

  isNearContainerEdge(mouseY, containerHeight, threshold) {
    return mouseY < threshold || mouseY > (containerHeight - threshold)
  },

  /**
   * 检查是否在组件区域内
   * @param {number} mouseY
   * @param {HTMLElement[]} children
   * @param containerRef
   * @returns {boolean}
   */
  isInsideAnyComponent(mouseY, children, containerRef) {
    const containerRect = containerRef.value.getBoundingClientRect()
    const scrollTop = containerRef.value.scrollTop

    return children.some(child => {
      const childRect = child.getBoundingClientRect()
      // 增加2px的缓冲区（修改计算方式）
      const topThreshold = Math.max(2, childRect.height * 0.1)
      const adjustedTop = childRect.top - containerRect.top + scrollTop + topThreshold
      const adjustedBottom = childRect.bottom - containerRect.top + scrollTop - topThreshold

      return mouseY >= adjustedTop && mouseY <= adjustedBottom
    })
  },

  isInsideComponent(mouseY, element, container) {
    const rect = element.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    return mouseY >= rect.top - containerRect.top &&
      mouseY <= rect.bottom - containerRect.top
  }
}
