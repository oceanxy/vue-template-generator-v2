/**
 * @global
 * @typedef {Object} TGCanvas
 * @property {number} width - 画布宽度
 * @property {string} backgroundColor - 画布背景色
 * @property {string} layoutType - 布局类型，flex | grid
 * @property {{[key in keyof CSSStyleDeclaration]?: string}} style - 布局样式
 */
import { ref, toRaw, watch } from 'vue'
import { useEditorStore } from '../stores/useEditorStore'

export default {
  name: 'CanvasRenderer',
  props: ['schema', 'handleDrop'],
  setup(props) {
    const canvasContainerRef = ref(null)
    const componentSchemas = ref(props.schema.components)
    const store = useEditorStore()
    const indicatorRef = ref(null)
    const lastValidIndex = ref(-1)
    const rafId = ref(null)
    const childRectsCache = new WeakMap()
    const indicatorType = ref('none') // 'none' | 'placeholder' | 'container'

    watch(
      () => props.schema.components,
      val => {
        componentSchemas.value = [...val]
      }, { deep: true, immediate: true }
    )

    watch(
      () => canvasContainerRef.value?.scrollTop,
      () => {
        if (rafId.value) {
          cancelAnimationFrame(rafId.value)
          rafId.value = null
        }
      }
    )

    const getSafeRef = () => {
      return {
        container: canvasContainerRef.value,
        indicator: indicatorRef.value,
        children: () => {
          const children = Array.from(canvasContainerRef.value?.children || [])
            .filter(el => el.classList.contains('tg-editor-canvas-component'))

          // 缓存元素位置信息
          children.forEach(child => {
            if (!childRectsCache.has(child)) {
              childRectsCache.set(child, child.getBoundingClientRect())
            }
          })

          return children
        }
      }
    }

    /**
     * @typedef {Object} PositionInfo
     * @property {number} mouseY - 相对于容器顶部的Y坐标
     * @property {HTMLElement[]} children - 可见子元素集合
     * @property {number[]} midPoints - 子元素中点Y坐标集合
     */

    const updateIndicatorPosition = e => {
      const { container, indicator, children } = getSafeRef()
      if (!container || !indicator) return

      // 提取坐标系计算逻辑
      const getMousePosition = () => {
        const containerRect = container.getBoundingClientRect()
        return e.clientY - containerRect.top + container.scrollTop
      }

      // 提取子元素中间点计算
      const calculateChildMidPoints = (containerRect, children) => {
        return children.map(child => {
          const rect = child.getBoundingClientRect()
          const topRelative = rect.top - containerRect.top + container.scrollTop
          return topRelative + child.offsetHeight / 2
        })
      }

      // 边界处理逻辑封装
      const determineInsertIndex = (mouseY, midPoints) => {
        const index = midPoints.findIndex(midY => mouseY < midY)
        return index === -1 ? midPoints.length : index
      }

      // 目标位置计算器
      const calculateTargetPosition = (insertIndex, children, midPoints) => {
        const EDGE_THRESHOLD = 20
        const [firstChild, lastChild] = [children[0], children[children.length - 1]]

        if (children.length === 0) return 15
        if (insertIndex === 0 && mouseY < midPoints[0] - EDGE_THRESHOLD) {
          return firstChild.offsetTop - 2
        }
        if (insertIndex === children.length) {
          return lastChild.offsetTop + lastChild.offsetHeight + 2
        }

        return children[insertIndex].offsetTop - 2
      }

      // 新增容器尺寸计算
      const containerRect = container.getBoundingClientRect()
      const mouseY = e.clientY - containerRect.top + container.scrollTop
      const freshChildren = children()

      // 空画布处理逻辑
      if (freshChildren.length === 0) {
        indicatorType.value = 'container'
        indicator.style.display = 'block'
        indicator.style.top = '15px' // 默认顶部位置
        return
      }

      // 计算最近组件距离
      const distances = freshChildren.map(child => {
        const rect = child.getBoundingClientRect()
        const centerY = rect.top + rect.height / 2 - containerRect.top
        return Math.abs(mouseY - centerY)
      })
      const minDistance = Math.min(...distances)
      const DISTANCE_THRESHOLD = 50 // 距离阈值

      // 判断显示类型
      if (minDistance > DISTANCE_THRESHOLD) {
        indicatorType.value = 'container'
        indicator.style.top = mouseY < containerRect.height / 2
          ? '15px'
          : `${container.scrollHeight - 15}px`
      } else {
        // 原有占位线计算逻辑
        const childMidPoints = calculateChildMidPoints(containerRect, freshChildren)
        const insertIndex = determineInsertIndex(mouseY, childMidPoints)
        const targetPos = calculateTargetPosition(insertIndex, freshChildren, childMidPoints)

        indicatorType.value = 'placeholder'
        indicator.style.top = `${targetPos}px`
      }

      // 更新显示状态
      indicator.style.display = 'block'
    }

    // 强制重置所有状态
    const resetIndicator = () => {
      indicatorType.value = 'none'
      indicatorRef.value.style.display = 'none'
      lastValidIndex.value = -1
    }

    const updateComponent = componentDef => {
      store.updateComponent(componentDef)
    }

    const handleDragStart = (e, componentSchema) => {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', componentSchema.id)

      // 新增拖拽类型标记
      e.dataTransfer.setData('application/json', JSON.stringify({
        type: 'MOVE',
        data: { id: componentSchema.id }
      }))

      e.currentTarget.classList.add('dragging')
    }

    const handleDragEnd = e => {
      e.stopPropagation()
      e.currentTarget.classList.remove('dragging')

      resetIndicator()

      if (rafId.value) {
        cancelAnimationFrame(rafId.value)
        rafId.value = null
      }

      // 重置拖拽元素状态
      document.querySelectorAll('.tg-editor-canvas-container .dragging').forEach(el => {
        el.classList.remove('dragging')
      })
    }

    const handleDragOver = e => {
      e.preventDefault()

      if (rafId.value) return

      // 使用requestAnimationFrame节流
      rafId.value = requestAnimationFrame(() => {
        updateIndicatorPosition(e)
        rafId.value = null
      })
    }

    const handleDrop = e => {
      let insertIndex = lastValidIndex.value

      if (indicatorType.value === 'container') {
        insertIndex = componentSchemas.value.length
      }

      if (rafId.value) {
        cancelAnimationFrame(rafId.value)
        rafId.value = null
      }

      props.handleDrop(e, insertIndex)
      resetIndicator()
    }

    const handleDragLeave = e => {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        // 清理逻辑
        if (rafId.value) {
          cancelAnimationFrame(rafId.value)
          rafId.value = null
        }

        resetIndicator()
      }
    }

    const renderCanvasFromSchemas = (componentSchema, index) => {
      const componentDef = store.getComponentByType(componentSchema.type, componentSchema.category)
      if (!componentDef) return null

      return (
        <div
          key={componentSchema.id}
          data-id={componentSchema.id}
          data-index={index}
          class={{
            [componentDef.className]: true,
            'tg-editor-canvas-component': true
          }}
          style={{
            ...componentDef.style,
            ...componentSchema.props.style
          }}
          draggable
          onClick={() => updateComponent(toRaw(componentSchema))}
          onDragstart={e => {
            handleDragStart(e, componentSchema)
            e.stopPropagation()
          }}
        >
          {componentDef.preview({ ...componentDef.defaultProps, ...componentSchema.props })}
        </div>
      )
    }

    return () => (
      <div
        ref={canvasContainerRef}
        class={'tg-editor-canvas-container'}
        style={{ width: props.schema.canvas.width }}
        onDrop={handleDrop}
        onDragover={handleDragOver}
        onDragend={handleDragEnd}
        onDragleave={handleDragLeave}
      >
        {componentSchemas.value.map(renderCanvasFromSchemas)}
        <div
          ref={indicatorRef}
          class="tg-editor-drag-placeholder"
          data-type={indicatorType.value !== 'none' ? indicatorType.value : null}
        />
      </div>
    )
  }
}
