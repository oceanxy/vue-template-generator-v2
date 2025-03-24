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

    const renderCanvasFromSchemas = componentSchema => {
      const componentDef = store.getComponentByType(componentSchema.type, componentSchema.category)
      if (!componentDef) return null

      componentDef.id = componentSchema.id

      return (
        <div
          key={componentSchema.id}
          class={componentDef.className}
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
        onDrop={props.handleDrop}
        onDragover={e => e.preventDefault()}
      >
        {componentSchemas.value.map(renderCanvasFromSchemas)}
      </div>
    )
  }
}
