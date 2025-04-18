import { computed, ref, toRaw, watch } from 'vue'
import { useEditorStore } from '../stores/useEditorStore'
import { omit } from 'lodash'
import { styleWithUnits } from '../utils/style'
import ComponentsActionBar from './ComponentsActionBar'
import DragPlaceholder from './DragPlaceholder'
import useDragDrop from '../hooks/useDragDrop'
import { TG_MATERIAL_CATEGORY } from '@/components/TGEditor/materials'
import { Geometry } from '@/components/TGEditor/utils/geometry'

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

    const renderCanvasFromSchemas = (componentSchema, parentId = null) => {
      const componentDef = store.getComponentByType(
        componentSchema.type,
        componentSchema.category
      )

      if (!componentDef) return null

      // 初始化组件props
      const component = {
        ...componentSchema.props,
        style: styleWithUnits(componentSchema.props?.style ?? {}),
        previewType: 'canvas'
      }

      const isLayoutComp = componentSchema.category === TG_MATERIAL_CATEGORY.LAYOUT

      if (isLayoutComp) {
        component.style.width = component.style.width || '100%'
        component.style.height = component.style.height || 'auto'
      }

      const canvasCompCategoryClassName = `tg-editor-${componentSchema.category}-component`

      // 添加布局组件的嵌套支持
      if (componentSchema.category === TG_MATERIAL_CATEGORY.LAYOUT) {
        component.children = componentSchema.children?.map(childSchema =>
          renderCanvasFromSchemas(childSchema, componentSchema.id)
        ) ?? []
      }

      return (
        <div
          key={componentSchema.id}
          data-id={componentSchema.id}
          data-parent-id={parentId}
          data-selected={selectedComponent.value?.id === componentSchema.id}
          data-nested-level={Geometry.calculateNestedLevelById(componentSchema.id, componentSchemas.value)} // 新增此行
          draggable
          class={{
            [canvasCompCategoryClassName]: true,
            'tg-editor-drag-component': true,
            'dragging': componentSchema.__dragging // 拖动状态样式
          }}
          {
            // 布局组件要应用容器样式到拖拽容器上
            ...(isLayoutComp && { style: component.style })
          }
          onClick={(e) => {
            e.stopPropagation()
            store.updateComponent({
              ...toRaw(componentSchema),
              configForm: componentDef.configForm
            })
          }}
          onDragstart={(e) => {
            componentSchema.__dragging = true // 标记拖动状态
            dragHandlers.handleDragStart(e, componentSchema)
            e.stopPropagation()
          }}
          onDragend={(e) => {
            componentSchema.__dragging = false
            dragHandlers.handleDragEnd(e)
          }}
        >
          {componentDef.preview(component)}
        </div>
      )
    }

    return () => {
      const canvasStyle = styleWithUnits(schema.value.canvas.style)

      return (
        <div class={'tg-editor-canvas-layout'}>
          <div
            ref={containerRef}
            {...omit(schema.value.canvas, ['class', 'style'])}
            data-selected={selectedComponent.value?.type === 'canvas'}
            class={[
              'tg-editor-canvas-container',
              { [schema.value.canvas.class]: true }
            ]}
            style={{
              ...canvasStyle,
              '--canvas-padding': canvasStyle?.padding || '15px',
              overflowY: store.indicator.type === 'container' ? 'hidden' : 'auto'
            }}
            onClick={handleCanvasClick}
            onDrop={e => dragHandlers.handleDrop(e, containerRef)}
            onDragover={e => dragHandlers.handleDragOver(e, containerRef)}
            onDragend={dragHandlers.handleDragEnd}
            onDragleave={dragHandlers.handleDragLeave}
          >
            {componentSchemas.value.map(renderCanvasFromSchemas)}
            <ComponentsActionBar containerRef={containerRef} />
            <DragPlaceholder ref={el => indicatorRef.value = el.$el} />
          </div>
        </div>
      )
    }
  }
}
