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

    const updateIndicatorPosition = e => {
      const { container, indicator, children } = getSafeRef()
      if (!container || !indicator) return

      // 获取精确容器坐标系（包含滚动偏移）
      const containerRect = container.getBoundingClientRect()
      const scrollTop = container.scrollTop // 新增滚动偏移量

      // 计算相对于容器内容区域顶部的Y坐标（包含滚动位置）
      const mouseY = e.clientY - containerRect.top + scrollTop

      const freshChildren = children()
      if (freshChildren.length === 0) {
        indicator.style.display = 'none'
        return
      }

      // 获取所有子元素的中间点Y坐标（相对容器）
      const childMidPoints = freshChildren.map(child => {
        const rect = child.getBoundingClientRect()
        const topRelative = rect.top - containerRect.top + scrollTop
        return topRelative + child.offsetHeight / 2
      })

      // 寻找第一个中间点大于鼠标位置的索引
      let insertIndex = childMidPoints.findIndex(midY => mouseY < midY)
      insertIndex = insertIndex === -1 ? freshChildren.length : insertIndex

      // 边界处理逻辑
      const edgeThreshold = 20 // 边界检测阈值
      let targetPos = 0

      if (freshChildren.length === 0) {
        targetPos = 15 // 对应容器的padding-top
      } else if (insertIndex === 0 && mouseY < childMidPoints[0] - edgeThreshold) {
        // 顶部边界情况
        targetPos = freshChildren[0].offsetTop - 2
      } else if (insertIndex === freshChildren.length) {
        // 底部边界情况
        const lastChild = freshChildren[freshChildren.length - 1]
        targetPos = lastChild.offsetTop + lastChild.offsetHeight + 2
      } else {
        // 常规中间位置
        targetPos = freshChildren[insertIndex].offsetTop - 2
      }

      // 位置更新逻辑
      if (insertIndex !== lastValidIndex.value) {
        indicator.style.display = 'block'
        indicator.style.top = `${targetPos}px` // 使用新计算的位置
        lastValidIndex.value = insertIndex
      }
    }

    const getComponentRects = () => {
      return Array.from(canvasContainerRef.value?.querySelectorAll('.tg-editor-canvas-component') || [])
        .filter(el => !el.classList.contains('dragging'))
        .map(el => el.getBoundingClientRect())
    }

    const findInsertPosition = (clientY) => {
      const rects = getComponentRects()
      if (rects.length === 0) return -1

      return rects.findIndex(rect => {
        const midY = rect.top + rect.height / 2
        return clientY < midY
      })
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

      // 强制重置所有状态
      indicatorRef.value.style.display = 'none'
      lastValidIndex.value = -1
      if (rafId.value) {
        cancelAnimationFrame(rafId.value)
        rafId.value = null
      }

      // 必须重置拖拽元素状态
      document.querySelectorAll('.dragging').forEach(el => {
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

    const handleDragLeave = e => {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        indicatorRef.value.style.display = 'none'
      }
    }

    const handleDrop = e => {
      cancelAnimationFrame(rafId.value)
      const insertIndex = lastValidIndex.value
      props.handleDrop(e, insertIndex) // 需要调整父组件传递的handleDrop参数
      indicatorRef.value.style.display = 'none'
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
      >
        {componentSchemas.value.map(renderCanvasFromSchemas)}
        <div
          ref={indicatorRef}
          class="tg-editor-drag-placeholder"
        />
      </div>
    )
  }
}
