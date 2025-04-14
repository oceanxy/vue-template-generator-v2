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
   * @param container
   * @returns {boolean}
   */
  isInsideAnyComponent(mouseY, children, container) {
    const containerRect = container.getBoundingClientRect()
    const scrollTop = container.scrollTop

    return children.some(child => {
      const childRect = child.getBoundingClientRect()
      // 增加2px的缓冲区（修改计算方式）
      const topThreshold = Math.max(2, childRect.height * 0.1)
      const adjustedTop = childRect.top - containerRect.top + scrollTop + topThreshold
      const adjustedBottom = childRect.bottom - containerRect.top + scrollTop - topThreshold

      return mouseY >= adjustedTop && mouseY <= adjustedBottom
    })
  },

  /**
   * 查找最近的布局容器
   * @param e
   * @param componentSchemas
   * @returns {{inValidLayoutArea: boolean, containerEl: *, parentSchema: ([]|*|null)}|null}
   */
  findDropContainer(e, componentSchemas) {
    // ========================== 注意此处有坑，浏览器兼容性问题 =============================
    // 在某些浏览器环境下（特别是使用Vue的合成事件系统时），`e.composedPath()`可能无法正确获取事件路径。
    let path = e.composedPath()

    if (!path?.length) {
      path = this.getEventPath(e)
    }

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
    const inValidLayoutArea = path.some(el =>
      el.classList?.contains('tg-editor-drag-placeholder-within-layout')
    )

    // 查找最近的布局组件（拖拽的组件将保存到该组件的children中）
    // 容器查找，主要为了区分鼠标是否处于布局组件的子组件容器区域内
    const closestLayoutComponent = path.find(el => {
      const isLayoutComponent = el.classList?.contains('tg-editor-layout-component')
      return isLayoutComponent && inValidLayoutArea
    }) || path.find(el => el.classList?.contains('tg-editor-canvas-container'))

    if (!closestLayoutComponent) return null

    /**
     * 深度优先搜索查找嵌套schema
     * @param schemas
     * @param [targetId]
     * @returns {[]|*|null}
     */
    const findNestedSchema = (schemas, targetId) => {
      if (targetId) {
        for (const comp of schemas) {
          if (comp.id === targetId) return comp?.children ?? []

          if (comp.children) {
            const found = findNestedSchema(comp.children, targetId)
            if (found) return found
          }
        }
      }

      return schemas
    }

    return {
      inValidLayoutArea,
      containerEl: closestLayoutComponent,
      parentSchema: findNestedSchema(componentSchemas, closestLayoutComponent.dataset.id)
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
  }
}
