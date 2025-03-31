/**
 * @global
 * @typedef {Object} TGCanvas
 * @property {number} width - 画布宽度
 * @property {string} backgroundColor - 画布背景色
 * @property {string} layoutType - 布局类型，flex | grid
 * @property {{[key in keyof CSSStyleDeclaration]?: string}} style - 布局样式
 */
import { computed, ref, toRaw, watch } from 'vue'
import { useEditorStore } from '../stores/useEditorStore'
import { omit } from 'lodash'
import { styleWithUnits } from '@/components/TGEditor/utils/style'

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
    const selectedComponent = computed(() => store.selectedComponent)

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

    const parseStyleValue = (value, defaultValue = 0) => {
      if (typeof value === 'number') return value
      if (!value) return defaultValue
      const match = value.match(/^([\d.]+)(px|%)$/)
      return match ? parseFloat(match[1]) : defaultValue
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
        const paddingTop = parseStyleValue(
          props.schema.canvas.style?.paddingTop || props.schema.canvas.style?.padding,
          15
        )
        const paddingBottom = parseStyleValue(props.schema.canvas.style?.paddingBottom ||
          props.schema.canvas.style?.padding, 15)

        if (children.length === 0) return paddingTop

        // 顶部边界
        if (insertIndex === 0 && mouseY < midPoints[0] - EDGE_THRESHOLD) {
          return children[0].offsetTop - 2
        }

        // 底部边界
        if (insertIndex === children.length) {
          const lastChild = children[children.length - 1]
          return lastChild.offsetTop + lastChild.offsetHeight
        }

        return children[insertIndex].offsetTop - 2
      }

      // 新增容器尺寸计算
      const containerRect = container.getBoundingClientRect()
      const mouseY = e.clientY - containerRect.top + container.scrollTop
      const freshChildren = children()
      // 动态获取画布样式
      const canvasStyle = props.schema.canvas.style || {}
      // 转换padding值为像素（示例：处理"20px"格式）
      const parsePadding = (value) => parseInt(value) || 0
      const containerPaddingTop = parsePadding(canvasStyle.paddingTop || canvasStyle.padding || '15px')
      const containerPaddingBottom = parsePadding(canvasStyle.paddingBottom || canvasStyle.padding || '15px')

      // 空画布处理逻辑
      if (freshChildren.length === 0) {
        indicatorType.value = 'container'
        indicator.style.display = 'block'
        indicator.style.top = `${containerPaddingTop}px` // 默认顶部位置
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
        lastValidIndex.value = -1
        const isTop = mouseY < containerRect.height / 2
        indicator.style.top = isTop
          ? `${containerPaddingTop}px`
          : `${container.scrollHeight - containerPaddingBottom}px`
      } else {
        // 原有占位线计算逻辑
        const childMidPoints = calculateChildMidPoints(containerRect, freshChildren)
        const insertIndex = determineInsertIndex(mouseY, childMidPoints)
        const targetPos = calculateTargetPosition(insertIndex, freshChildren, childMidPoints)

        indicatorType.value = 'placeholder'
        lastValidIndex.value = insertIndex
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

    const updateComponent = (e, componentDef) => {
      e.stopPropagation()
      store.updateComponent(componentDef)
    }

    const handleDragStart = (e, componentSchema) => {
      store.selectedComponent = null

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

      // 边界检查
      insertIndex = Math.max(0, Math.min(insertIndex, componentSchemas.value.length))

      const componentSchema = props.handleDrop(e, insertIndex)
      resetIndicator()

      store.updateComponent(componentSchema)
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

    const handleCanvasClick = e => {
      // 确保点击的是容器本身而非子元素
      if (e.target === e.currentTarget) {
        store.updateComponent({
          type: 'canvas',
          id: 'canvas-root',
          configForm: store.canvasConfigForm
        })
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
          data-selected={selectedComponent.value?.id === componentSchema.id}
          class={{
            [componentDef.class]: true,
            'tg-editor-canvas-component': true
          }}
          style={{
            ...componentDef.style,
            ...componentSchema.props.style
          }}
          draggable
          onClick={e => updateComponent(e, toRaw(componentSchema))}
          onDragstart={e => {
            handleDragStart(e, componentSchema)
            e.stopPropagation()
          }}
        >
          {componentDef.preview({ ...componentDef.defaultProps, ...componentSchema.props })}
        </div>
      )
    }

    return () => {
      const canvasStyle = styleWithUnits(props.schema.canvas.style)

      return (
        <div
          ref={canvasContainerRef}
          {...omit(props.schema.canvas, ['class', 'style'])}
          class={['tg-editor-canvas-container', { [props.schema.canvas.class]: true }]}
          data-selected={selectedComponent.value?.type === 'canvas'}
          style={{
            ...canvasStyle,
            '--canvas-padding': canvasStyle?.padding || '15px'
          }}
          onClick={handleCanvasClick}
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
}
