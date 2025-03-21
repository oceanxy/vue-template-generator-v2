import { useStore } from '../stores/useStore'
import { ref } from 'vue'

/**
 * @global
 * @typedef {Object} TGCanvas
 * @property {number} width - 画布宽度
 * @property {string} backgroundColor - 画布背景色
 * @property {string} layoutType - 布局类型，flex | grid
 * @property {{[key in keyof CSSStyleDeclaration]?: string}} style - 布局样式
 */

export default {
  name: 'CanvasRenderer',
  props: ['schema'],
  setup(props) {
    const store = useStore()
    const renderComponents = ref(props.schema.components)

    const renderComponent = (comp) => {
      const componentDef = store.getComponentByType(comp.type)
      if (!componentDef) return null

      return (
        <div
          key={comp.id}
          class={componentDef.className}
          style={{
            ...componentDef.style,
            ...comp.style
          }}
        >
          {componentDef.preview({ ...comp.defaultProps, ...comp.props })}
        </div>
      )
    }

    return () => (
      <div
        class={'tg-editor-canvas-area'}
        style={{ width: props.schema.canvas.width }}
      >
        {renderComponents.value.map(renderComponent)}
      </div>
    )
  }
}
