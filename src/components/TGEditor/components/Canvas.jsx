/**
 * @global
 * @typedef {Object} TGCanvas
 * @property {number} width - 画布宽度
 * @property {string} backgroundColor - 画布背景色
 * @property {string} layoutType - 布局类型，flex | grid
 * @property {{[key in keyof CSSStyleDeclaration]?: string}} style - 布局样式
 */
import { ref, watch } from 'vue'
import { useEditorStore } from '../stores/useEditorStore'

export default {
  name: 'CanvasRenderer',
  props: ['schema', 'handleDrop'],
  setup(props) {
    const componentSchemas = ref(props.schema.components)
    const store = useEditorStore()

    watch(componentSchemas, val => {
      componentSchemas.value = val
    }, { deep: true })

    const _updateComponent = componentDef => {
      store.updateComponent(componentDef)
    }

    const handleDragOver = e => {
      e.preventDefault()

      const elements = document.elementsFromPoint(e.clientX, e.clientY)
      const components = elements.filter(el => el.classList.contains('tg-editor-canvas-component'))

      if (components.length > 0) {
        const currentElement = components[0]
        const rect = currentElement.getBoundingClientRect()
        const mouseY = e.clientY
        const isTopHalf = mouseY < rect.top + rect.height / 2

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
      const componentDef = store.updateComponent(componentSchema)
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
          onClick={() => _updateComponent(componentDef)}
        >
          {componentDef.preview({ ...componentDef.defaultProps, ...componentSchema.props })}
        </div>
      )
    }

    return () => (
      <div
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
