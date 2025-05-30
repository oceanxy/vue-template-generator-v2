/**
 * 几何计算工具模块
 */

export const Geometry = {
  /**
   * 计算子元素中点坐标
   * 相对于直接容器左侧或顶部，例如：
   * 如果该容器是画布，则计算基于画布的坐标；
   * 如果该容器是布局组件，则计算基于布局组件的布局容器的坐标。
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
   * @param containerScrollTop
   * @returns {boolean}
   */
  isInsideAnyComponent(mouseY, children, containerRect, containerScrollTop) {
    return children.some(child => {
      const childRect = child.getBoundingClientRect()
      const adjustedTop = childRect.top - containerRect.top + containerScrollTop
      const adjustedBottom = childRect.bottom - containerRect.top + containerScrollTop

      return mouseY >= adjustedTop && mouseY <= adjustedBottom
    })
  },

  /**
   * 查找最近的布局组件的布局容器（查找最近的合法父容器）
   * 这里的父容器指子组件的直接父容器
   * 布局组件中为 .tg-designer-layout-container
   * 画布中为 .tg-designer-canvas-container
   * @param e
   * @param componentSchemas
   * @returns {{
   *  isInsideLayoutContainer: boolean,
   *  dropContainer: HTMLElement,
   *  schema: ([]|*|null),
   *  parentId: string
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
     * 画布中组件的拖拽容器，预览时无此容器：div.tg-designer-drag-component
     * 布局组件根元素：div.tg-designer-layout-container
     * @type {boolean}
     */
    let isInsideLayoutContainer = true
    let layoutCompId = undefined

    const draggingElement = path.find(el => el.classList?.contains('dragging'))
    const isDraggingLayout = draggingElement?.classList?.contains('tg-designer-layout-component')

    // 查找最近的布局组件（拖拽的组件将保存到该组件的children中）
    // 容器查找，主要为了区分鼠标是否处于布局组件的子组件容器区域内
    let closestLayoutComponent = path.find(el => {
      if (!(el instanceof Node)) return false

      // 排除被拖拽布局组件自身及其子容器
      if (isDraggingLayout && draggingElement.contains(el)) return false
      return el.classList?.contains('tg-designer-layout-container')
    })

    if (!closestLayoutComponent) {
      isInsideLayoutContainer = false
      closestLayoutComponent = path.find(el => el.classList?.contains('tg-designer-canvas-container'))
    } else {
      layoutCompId = closestLayoutComponent.closest('.tg-designer-layout-component').dataset.id
    }

    if (!closestLayoutComponent) return null

    const nestedSchema = this.findNestedSchema(componentSchemas, layoutCompId, 'children', componentSchemas)

    return {
      isInsideLayoutContainer,
      dropContainer: closestLayoutComponent,
      schema: nestedSchema.schema,
      parentId: nestedSchema.parentId
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
   * @param schema {TGComponentSchema[]} - schema
   * @param [targetId] {string} - 要查找的schema的id
   * @param [returnType='self'] {'parent'|'self'|'children'} - 返回查找到的schema的类型。
   * - 'parent'：返回父级schema；
   * - 'self'：返回自身schema；
   * - 'children'：返回子级schema。
   * @param [parent=null] {TGComponentSchema | null} - 父级schema
   * @returns {{schema: TGComponentSchema|TGComponentSchema[]|null, parentId: string}
   */
  findNestedSchema(schema, targetId, returnType = 'self', parent = null) {
    if (targetId) {
      let i = 0
      for (const comp of schema) {
        if (comp.id === targetId) {
          switch (returnType) {
            case 'parent':
              return { schema: parent?.children ?? null, parentId: parent?.id }
            case 'self':
              return { schema: comp, parentId: parent?.id }
            case 'children':
            default:
              return { schema: comp.children, parentId: comp.id }
          }
        }

        if (comp.children?.length) {
          const found = this.findNestedSchema(comp.children, targetId, returnType, comp)
          if (found) return found
        }

        if (i >= schema.length - 1) {
          return undefined
        } else {
          i++
        }
      }
    }

    return {
      schema,
      parentId: ''
    }
  },

  calculateNestedLevel(element) {
    return element?.closest('.tg-designer-layout-component')?.dataset?.nestedLevel || 0
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
   * @param mousePosition {number} - 当前鼠标位置（相对于当前容器）
   * @param {number[]} midPoints
   * @param config
   * @returns {number}
   */
  calculateComponentPosition(insertIndex, children, mousePosition, midPoints, config) {
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
      const finalPosition = (prevChild.offsetLeft + prevChild.offsetWidth + nextChild.offsetLeft) / 2
      const gap = config.gap / 2

      // 防止拖拽时，鼠标处于正在被拖拽的组件附近时，指示线的位置与正在被拖拽的组件重叠
      // 具体表现为指示线处于正在被拖拽的组件的中点位置
      return mousePosition >= finalPosition
        ? nextChild.offsetLeft - gap
        : prevChild.offsetLeft + prevChild.offsetWidth + gap
    } else {
      // 顶部边界处理
      if (insertIndex === 0 && midPoints.length > 0 && mousePosition < midPoints[0] - config.THRESHOLD.CONTAINER) {
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
      const finalPosition = (prevChild.offsetTop + prevChild.offsetHeight + nextChild.offsetTop) / 2
      const gap = config.gap / 2

      // 防止拖拽时，鼠标处于正在被拖拽的组件附近时，指示线的位置与正在被拖拽的组件重叠
      // 具体表现为指示线处于正在被拖拽的组件的中点位置
      return mousePosition >= finalPosition
        ? nextChild.offsetTop - gap
        : prevChild.offsetTop + prevChild.offsetHeight + gap
    }
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
      ? lastChildRect.width // 水平布局取宽度30%
      : threshold

    // 返回边界检测结果
    return mousePosition < thresholdPosition + dynamicThreshold
  },

  /**
   * 获取调整后的位置
   * @param {{clientX: number, clientY: number}} e
   * @param container
   * @param containerRect
   * @param direction
   * @returns {number|*}
   */
  getAdjustedPosition(e, container, containerRect, direction) {
    return direction === 'horizontal'
      ? e.clientX - containerRect.left
      : e.clientY - containerRect.top + container.scrollTop
  },

  /**
   * 获取当前容器下的子元素
   * @param children {HTMLCollection}
   * @returns {{all: unknown[], valid: unknown[]}}
   */
  getValidChildren(children) {
    const all = Array.from(children)
      .filter(el => el.classList.contains('tg-designer-drag-component'))
    // 排除正在拖动的元素
    const valid = all.filter(el => !el.classList.contains('dragging'))

    return { all, valid }
  },

  /**
   * 计算布局方向
   * @param componentId
   * @returns {{isInGridLayout: boolean, layoutDirection: string}}
   */
  getLayoutInfoById(componentId) {
    // 查找当前组件的拖拽层
    const element = document.querySelector(`[data-id="${componentId}"]`)
    // 查找最近的布局组件
    const layoutComponent = element?.closest('.tg-designer-layout-container')

    if (!element || !layoutComponent) return { isInGridLayout: false, layoutDirection: 'vertical' }

    const style = window.getComputedStyle(layoutComponent)

    return {
      isInGridLayout: !!layoutComponent.dataset?.cellPosition,
      layoutDirection: style.flexDirection.startsWith('row') ? 'horizontal' : 'vertical'
    }
  },

  /**
   * 创建自定义拖拽预览图像
   * 解决默认拖拽情况下的拖拽图像遮挡目标位置的情况
   * @param e {DragEvent}
   */
  createDragPreviewImage(e) {
    const el = e.currentTarget.cloneNode(true) // 克隆当前元素
    const rect = e.currentTarget.getBoundingClientRect()

    // 创建拖拽预览容器
    const dragPreview = document.createElement('div')
    dragPreview.style.width = `${rect.width}px`
    dragPreview.style.height = `${rect.height}px`
    dragPreview.style.position = 'fixed'
    dragPreview.style.pointerEvents = 'none'
    dragPreview.style.zIndex = '9999'
    dragPreview.style.opacity = '0.8'
    dragPreview.appendChild(el)
    document.body.appendChild(dragPreview)

    // 设置拖拽图像和偏移补偿
    const ghost = document.createElement('div')
    e.dataTransfer.setDragImage(ghost, 0, 0)

    // 实时更新预览位置
    const handleDrag = moveEvent => {
      dragPreview.style.left = `${moveEvent.clientX + 20}px`
      dragPreview.style.top = `${moveEvent.clientY + 30}px`
    }

    const cleanup = () => {
      document.removeEventListener('dragover', handleDrag)
      e.target.removeEventListener('dragend', cleanup)
      dragPreview.remove()
    }

    document.addEventListener('dragover', handleDrag)
    e.target.addEventListener('dragend', cleanup)
  },

  /**
   * 在数组中查找给定Grid布局中的下一个空位，查找方向为从左至右，从上到下。
   * @param elements {Object[]} - 查找源，必须包含`cellPosition`字段
   * @param [rowCount=2] {number} - 行数，默认2
   * @param [colCount=2] {number} - 列数，默认2
   * @param [position] {string} - 查找起始位置，默认为 '0-0'
   * @returns {{row: number, col: number, position: string} | null}
   */
  findNextEmptyPosition({ elements, rowCount = 2, colCount = 2, position = '0-0' } = {}) {
    // 创建一个映射来快速查找已存在的 positions
    const positionMap = new Set(elements.map(el => el.cellPosition))

    // 解析起始位置
    const [startRowStr, startColStr] = position.split('-')
    let currentRow = parseInt(startRowStr, 10)
    let currentCol = parseInt(startColStr, 10)

    // 遍历所有可能的位置
    for (let row = currentRow; row < rowCount; row++) {
      for (let col = (row === currentRow ? currentCol + 1 : 0); col < colCount; col++) {
        const pos = `${row}-${col}`

        if (!positionMap.has(pos)) {
          return { row, col, position: pos } // 返回第一个找到的空位
        }
      }
    }

    // 如果没有找到空位返回 null
    return null
  },

  /**
   * 在数组中查找给定Grid布局中的相邻位置
   * @param elements {Object[]} - 查找源，必须包含`cellPosition`字段
   * @param position {string} - 基准位置（格式：row-col）
   * @param direction {string} - 检查方向（up/down/left/right）
   * @param [rowCount=2] {number} - 总行数，默认2
   * @param [colCount=2] {number} - 总列数，默认2
   * @returns {null | {row: number, col: number, position: string, isEmptyAdjacentLocation: boolean}}
   */
  checkAdjacentPositionInGridLayout({ elements, position, direction, rowCount = 2, colCount = 2 } = {}) {
    // 创建快速查找的position集合
    const positionSet = new Set(elements.map(el => el.cellPosition))

    // 解析当前坐标
    const [currentRow, currentCol] = position.split('-').map(Number)

    // 根据方向计算目标坐标
    let targetRow = currentRow
    let targetCol = currentCol

    switch (direction) {
      case 'up':
        targetRow--
        break
      case 'down':
        targetRow++
        break
      case 'left':
        targetCol--
        break
      case 'right':
        targetCol++
        break
      default:
        throw new Error('无效的搜索方向')
    }

    // 边界检查（性能关键点）
    if (targetRow < 0 || targetRow >= rowCount || targetCol < 0 || targetCol >= colCount) {
      return null
    }

    // 构造目标位置字符串
    const targetPos = `${targetRow}-${targetCol}`

    // 返回检查结果
    return {
      row: targetRow,
      col: targetCol,
      position: targetPos,
      isEmptyAdjacentLocation: !positionSet.has(targetPos)
    }
  }
}
