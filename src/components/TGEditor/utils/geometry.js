/**
 * 几何计算工具模块
 */

export const Geometry = {
  /**
   * 计算子元素中点坐标（相对于直接容器左侧或顶部）
   * @param containerRect
   * @param {HTMLElement[]} elements
   * @param direction
   * @param scrollTop
   * @returns {number[]}
   */
  calculateCompMidPoints(containerRect, elements, direction, scrollTop = 0) {
    const points = elements.map(el => {
      const rect = el.getBoundingClientRect()
      // 添加可视化位置排序（解决 flex 反向布局问题）
      const visualPos = direction === 'horizontal'
        ? rect.left + rect.width / 2
        : rect.top + rect.height / 2

      return visualPos - (direction === 'horizontal'
        ? containerRect.left
        : containerRect.top) + (direction === 'vertical' ? scrollTop : 0)
    })

    // 确保水平布局按视觉顺序排序
    if (direction === 'horizontal') {
      points.sort((a, b) => a - b)
    }

    return points
  },

  /**
   * 使用二分查找确定插入位置
   * @param {number} target
   * @param {number[]} sortedArray
   * @returns {number}
   */
  determineInsertIndex(target, sortedArray) {
    if (sortedArray.length === 0) return 0

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

  /**
   * 检查是否在组件区域内
   * @param {number} mouseY
   * @param {HTMLElement[]} children
   * @param containerRect
   * @param scrollTop
   * @returns {boolean}
   */
  isInsideAnyComponent(mouseY, children, containerRect, scrollTop) {
    return children.some(child => {
      const childRect = child.getBoundingClientRect()
      // 增加2px的缓冲区
      const topThreshold = Math.max(2, childRect.height * 0.1)
      const adjustedTop = childRect.top - containerRect.top + scrollTop + topThreshold
      const adjustedBottom = childRect.bottom - containerRect.top + scrollTop - topThreshold

      return mouseY >= adjustedTop && mouseY <= adjustedBottom
    })
  },

  /**
   * 查找最近的布局组件的布局容器（查找最近的合法父容器）
   * 这里的父容器指子组件的直接父容器
   * 布局组件中为 .tg-editor-drag-placeholder-within-layout
   * 画布中为 .tg-editor-canvas-container
   * @param e
   * @param componentSchemas
   * @returns {{
   *  isInsideLayoutContainer: boolean,
   *  dropContainer: HTMLElement,
   *  parentSchema: ([]|*|null)
   * } | null}
   */
  findDropContainer(e, componentSchemas) {
    // ========================== 注意此处有坑，浏览器兼容性问题 =============================
    // 在某些浏览器环境下（特别是使用Vue的合成事件系统时），`e.composedPath()`可能无法正确获取事件路径。
    let path = e.composedPath()

    if (!path?.length) path = this.getEventPath(e)

    /**
     * 判断释放鼠标时的位置是否处于布局组件的容器区域
     * 1. 当鼠标处于画布空白区域时，将插入到画布中；
     * 2. 当鼠标处于任一基础组件、模板组件、布局组件的非容器区域时，将插入到上级容器中；
     * 3. 当鼠标处于布局组件内部存放子组件的容器区域时，将插入到布局组件中。
     *
     * 画布中组件的拖拽容器，预览时无此容器：div.tg-editor-drag-component
     * 布局组件根元素：div.tg-editor-layout-container
     * 布局组件存放子组件的容器区域：div.tg-editor-drag-placeholder-within-layout
     * @type {boolean}
     */
    let isInsideLayoutContainer = true
    let layoutCompId = undefined

    // 查找最近的布局组件（拖拽的组件将保存到该组件的children中）
    // 容器查找，主要为了区分鼠标是否处于布局组件的子组件容器区域内
    let closestLayoutComponent = path.find(el => el.classList?.contains('tg-editor-drag-placeholder-within-layout'))

    if (!closestLayoutComponent) {
      isInsideLayoutContainer = false
      closestLayoutComponent = path.find(el => el.classList?.contains('tg-editor-canvas-container'))
    } else {
      layoutCompId = closestLayoutComponent.closest('.tg-editor-layout-component').dataset.id
    }

    if (!closestLayoutComponent) return null

    return {
      isInsideLayoutContainer,
      dropContainer: closestLayoutComponent,
      parentSchema: this.findNestedSchema(componentSchemas, layoutCompId)
    }
  },

  /**
   * 获取事件路径
   * @param e
   * @returns {*|*[]}
   */
  getEventPath(e) {
    // Chrome/Safari直接使用e.path
    if (e.path) return e.path

    // 兼容Firefox等其他浏览器
    const path = []
    let target = e.target

    while (target && target !== document.documentElement) {
      path.push(target)
      target = target.parentElement
    }

    return path
  },

  /**
   * 深度优先搜索查找嵌套schema
   * @param schemas
   * @param [targetId]
   * @returns {[]|*|null}
   */
  findNestedSchema(schemas, targetId) {
    if (targetId) {
      let i = 0
      for (const comp of schemas) {
        if (comp.id === targetId) return comp?.children ?? []

        if (comp.children?.length) {
          const found = this.findNestedSchema(comp.children, targetId)
          if (found) return found
        }

        if (i >= schemas.length - 1) {
          return undefined
        } else {
          i++
        }
      }
    }

    return schemas
  },

  calculateNestedLevel(element) {
    return element?.closest('.tg-editor-layout-component')?.dataset?.nestedLevel || 0
  },

  /**
   * 计算组件的嵌套层级
   * @param {string} componentId
   * @param schemas
   * @returns {number}
   */
  calculateNestedLevelById(componentId, schemas) {
    let maxLevel = 0

    const traverse = (items, currentLevel) => {
      items.forEach(item => {
        if (item.id === componentId) {
          maxLevel = currentLevel
          return
        }
        if (item.children) {
          traverse(item.children, currentLevel + 1)
        }
      })
    }

    traverse(schemas, 1) // 根层级从1开始
    return maxLevel
  },

  /**
   * 计算组件间插入位置
   * @param {number} insertIndex
   * @param {HTMLElement[]} children
   * @param mouseY
   * @param {number[]} midPoints
   * @param config
   * @returns {number}
   */
  calculateComponentPosition(insertIndex, children, mouseY, midPoints, config) {
    if (config.direction === 'horizontal') {
      if (insertIndex === 0) {
        return Math.max(config.EDGE.OFFSET, children[0].offsetLeft - config.EDGE.OFFSET)
      }

      if (insertIndex === children.length) {
        const lastChild = children[children.length - 1]

        return lastChild.offsetLeft + lastChild.offsetWidth + config.EDGE.OFFSET
      }

      const prevChild = children[insertIndex - 1]
      const nextChild = children[insertIndex]

      return (prevChild.offsetLeft + prevChild.offsetWidth + nextChild.offsetLeft) / 2
    } else {
      // 顶部边界处理
      if (insertIndex === 0 && midPoints.length > 0 && mouseY < midPoints[0] - config.THRESHOLD.CONTAINER) {
        return children[0].offsetTop - config.EDGE.OFFSET
      }

      // 常规位置计算
      if (insertIndex === 0) {
        return Math.max(config.EDGE.OFFSET, children[0].offsetTop - config.EDGE.OFFSET)
      }

      if (insertIndex === children.length) {
        const lastChild = children[children.length - 1]
        return lastChild.offsetTop + lastChild.offsetHeight + config.EDGE.OFFSET
      }

      const prevChild = children[insertIndex - 1]
      const nextChild = children[insertIndex]

      return (prevChild.offsetTop + prevChild.offsetHeight + nextChild.offsetTop) / 2
    }
  },

  /**
   * 计算最小距离
   * @param {number} mouseY
   * @param {HTMLElement[]} children
   * @param container
   * @returns {number}
   */
  calculateMinDistance(mouseY, children, container) {
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
  },

  /**
   * 检查拖拽边缘阈值（根据布局方向动态调整）
   * @param containerRect - 当前容器元素
   * @param scrollTop
   * @param layoutDirection
   * @param {number} mousePosition - 根据布局方向可能是 Y 或 X 坐标
   * @param {HTMLElement[]} children - 子元素集合
   * @param {Object} config - 配置常量
   * @param isLayoutContainer
   * @returns {boolean} 是否触发容器指示线
   */
  checkDragEdgeThreshold(
    containerRect,
    scrollTop,
    layoutDirection,
    mousePosition,
    children,
    config,
    isLayoutContainer
  ) {
    if (children.length === 0) return false

    // 获取布局方向
    const isHorizontal = layoutDirection === 'horizontal'

    // 获取首个子元素的位置信息
    const lastChild = children.at(-1)
    const lastChildRect = lastChild.getBoundingClientRect()

    // 根据布局方向计算阈值位置
    const thresholdPosition = isHorizontal
      ? lastChildRect.right - containerRect.left
      : lastChildRect.bottom - containerRect.top + scrollTop

    const threshold = isLayoutContainer
      ? config.THRESHOLD.COMPONENT_AREA
      : config.THRESHOLD.CONTAINER

    // 计算实际阈值（增加方向感知）
    const dynamicThreshold = isHorizontal
      ? Math.min(threshold, lastChildRect.width * 0.3) // 水平布局取宽度30%
      : threshold

    // 返回边界检测结果
    return mousePosition < thresholdPosition + dynamicThreshold
  },

  getAdjustedPosition(e, container, containerRect, direction) {
    return direction === 'horizontal'
      ? e.clientX - containerRect.left
      : e.clientY - containerRect.top + container.scrollTop
  },

  getValidChildren(children) {
    return Array.from(children)
      .filter(el => el.classList.contains('tg-editor-drag-component'))
      // 排除正在拖动的元素
      .filter(el => !el.classList.contains('dragging'))
  },

  /**
   * 获取元素相对于指定容器的位置
   * @param {HTMLElement} element
   * @param {HTMLElement} container
   * @returns {DOMRect}
   */
  getRelativeRect(element, container) {
    const elementRect = element.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    return {
      left: elementRect.left - containerRect.left,
      top: elementRect.top - containerRect.top,
      right: elementRect.right - containerRect.left,
      bottom: elementRect.bottom - containerRect.top,
      width: elementRect.width,
      height: elementRect.height
    }
  }
}
