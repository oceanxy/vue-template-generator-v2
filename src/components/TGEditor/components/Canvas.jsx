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

    watch(
      () => props.schema.components,
      val => {
        componentSchemas.value = [...val]
      }, { deep: true, immediate: true }
    )

    const updateComponent = componentDef => {
      store.updateComponent(componentDef)
    }

    const handleDragStart = (e, componentSchema) => {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', componentSchema.id)
      e.currentTarget.classList.add('dragging')

      if (canvasContainerRef.value) {
        canvasContainerRef.value.classList.add('global-dragging-state')
      }

      store.setDraggingState(true)
    }

    const handleDragEnd = e => {
      e.currentTarget.classList.remove('dragging')

      // 确保容器状态类被清除
      if (canvasContainerRef.value) {
        canvasContainerRef.value.classList.remove('global-dragging-state')
      }

      store.setDraggingState(false)
    }

    const handleDragOver = e => {
      e.preventDefault()

      const elements = document.elementsFromPoint(e.clientX, e.clientY)
      const components = elements.filter(el =>
        el.classList.contains('tg-editor-canvas-component') &&
        !el.classList.contains('dragging') // 排除拖动元素自身
      )

      if (components.length === 0) {
        store.clearIndicator()
        return
      }

      const currentElement = components[0]
      const rect = currentElement.getBoundingClientRect()
      const mouseY = e.clientY
      const isTopHalf = mouseY < rect.top + rect.height * 0.4 // 调整敏感区域

      // 仅当目标变化时更新
      if (
        store.nearestElement !== currentElement ||
        store.lastDirection !== (isTopHalf ? 'top' : 'bottom')
      ) {
        store.clearIndicator()

        currentElement.classList.add(isTopHalf ? 'nearby-top' : 'nearby-bottom')
        store.nearestElement = currentElement
        store.lastDirection = isTopHalf ? 'top' : 'bottom'
      }
    }

    const handleDragLeave = () => {
      store.clearIndicator()
    }

    const handleDrop = e => {
      props.handleDrop(e)
      // 确保先处理 drop 再清除状态
      handleDragLeave()
    }

    const renderCanvasFromSchemas = componentSchema => {
      const componentDef = store.getComponentByType(componentSchema.type, componentSchema.category)
      if (!componentDef) return null

      return (
        <div
          key={componentSchema.id}
          data-id={componentSchema.id}
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
          onDragend={handleDragEnd}
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
        onDragleave={handleDragLeave}
      >
        {componentSchemas.value.map(renderCanvasFromSchemas)}
      </div>
    )
  }
}
