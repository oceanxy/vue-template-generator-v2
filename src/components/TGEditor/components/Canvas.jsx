import { computed, ref, toRaw, watch } from 'vue'
import { useEditorStore } from '../stores/useEditorStore'
import { omit } from 'lodash'
import { styleWithUnits } from '../utils/style'
import ComponentsActionBar from './ComponentsActionBar'
import useDragDrop from '../hooks/useDragDrop'

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
  setup() {
    const store = useEditorStore()
    const indicator = computed(() => store.indicator)
    const schema = computed(() => store.schema)
    const componentSchemas = computed(() => schema.value.components)
    const containerRef = ref(null)
    const indicatorRef = ref(null)
    const dragHandlers = useDragDrop()
    const selectedComponent = computed(() => store.selectedComponent)

    watch(
      componentSchemas,
      (val) => {
        store.schema.components.value = [...val]
      },
      { deep: true, immediate: true }
    )

    const handleCanvasClick = (e) => {
      if (e.target === e.currentTarget) {
        store.updateComponent({
          type: 'canvas',
          id: 'canvas-root',
          configForm: store.canvasConfigForm
        })
      }
    }

    const renderCanvasFromSchemas = (componentSchema, index) => {
      const componentDef = store.getComponentByType(
        componentSchema.type,
        componentSchema.category
      )

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
          onClick={(e) => {
            e.stopPropagation()
            store.updateComponent({
              ...toRaw(componentSchema),
              configForm: componentDef.configForm
            })
          }}
          onDragstart={(e) => {
            dragHandlers.handleDragStart(e, componentSchema)
            e.stopPropagation()
          }}
        >
          {componentDef.preview({
            ...componentDef.defaultProps,
            ...componentSchema.props
          })}
        </div>
      )
    }

    return () => {
      const canvasStyle = styleWithUnits(schema.value.canvas.style)

      return (
        <div
          ref={containerRef}
          {...omit(schema.value.canvas, ['class', 'style'])}
          class={[
            'tg-editor-canvas-container',
            { [schema.value.canvas.class]: true }
          ]}
          data-selected={selectedComponent.value?.type === 'canvas'}
          style={{
            ...canvasStyle,
            '--canvas-padding': canvasStyle?.padding || '15px'
          }}
          onClick={handleCanvasClick}
          onDrop={dragHandlers.handleDrop}
          onDragover={e => dragHandlers.handleDragOver(e, containerRef, indicatorRef)}
          onDragend={dragHandlers.handleDragEnd}
          onDragleave={dragHandlers.handleDragLeave}
        >
          {componentSchemas.value.map(renderCanvasFromSchemas)}
          <ComponentsActionBar containerRef={containerRef} />
          <div
            ref={indicatorRef}
            class="tg-editor-drag-placeholder"
            style={{ top: indicator.value.top }}
            data-type={
              indicator.value.type !== 'none'
                ? indicator.value.type
                : null
            }
          />
        </div>
      )
    }
  }
}
