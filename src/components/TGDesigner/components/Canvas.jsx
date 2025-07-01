import { computed, ref, toRaw } from 'vue'
import { useEditorStore } from '../stores/useEditorStore'
import { omit } from 'lodash'
import { getMarginValues, styleWithUnits } from '../utils/style'
import ComponentsActionBar from './ComponentsActionBar'
import DragPlaceholder from './DragPlaceholder'
import useDragDrop from '../hooks/useDragDrop'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import { Geometry } from '@/components/TGDesigner/utils/geometry'

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
    const designerStore = useEditorStore()
    const schema = computed(() => designerStore.schema)
    const componentSchemas = computed(() => schema.value.components)
    const containerRef = ref(null)
    const indicatorRef = ref(null)
    const dragHandlers = useDragDrop()
    const selectedComponent = computed(() => designerStore.selectedComponent)

    const handleCanvasClick = (e) => {
      if (e.target === e.currentTarget) {
        if (selectedComponent.value?.type === 'canvas') {
          designerStore.updateComponent()
        } else {
          designerStore.updateComponent({
            type: 'canvas',
            id: 'canvas-root',
            name: '画布',
            configForm: designerStore.canvasConfigForm
          })
        }
      }
    }

    const handleCompClick = (e, componentSchema, componentDef) => {
      e.stopPropagation()

      if (componentSchema.id === selectedComponent.value?.id) {
        designerStore.updateComponent()
      } else {
        designerStore.updateComponent({
          ...toRaw(componentSchema),
          configForm: componentDef.configForm
        })
      }
    }

    const handleCompDragStart = (e, componentSchema) => {
      componentSchema.__dragging = true // 标记拖动状态

      Geometry.createDragPreviewImage(e)
      dragHandlers.handleDragStart(e, componentSchema)

      e.stopPropagation()
    }

    const handleCompDragEnd = (e, componentSchema) => {
      componentSchema.__dragging = false

      if (!componentSchema.__initialized) {
        componentSchema.__initialized = true
      }

      dragHandlers.handleDragEnd(e)
    }

    const renderCanvasFromSchemas = (componentSchema, parentId = null) => {
      const componentDef = designerStore.getComponentByType(
        componentSchema.type,
        componentSchema.category
      )

      if (!componentDef) return null

      // 初始化组件props
      const component = omit({
        ...componentSchema.props,
        class: componentDef.class,
        style: styleWithUnits(componentSchema.props?.style ?? {}),
        previewType: TG_MATERIAL_PREVIEW_TYPE.CANVAS
      }, 'flexDirection')

      const isLayoutComp = componentSchema.category === TG_MATERIAL_CATEGORY.LAYOUT

      // ========================================================================
      // 在画布中时，组件的部分属性要应用到拖拽容器上，以适配画布上的组件显示。
      // 宽高（内部组件默认撑满容器）、外边距、overflow。

      const marginObj = getMarginValues(component.style)
      const dragCompStyle = {
        style: {
          width: `calc(${component.style.width} - ${marginObj.marginLeft} - ${marginObj.marginRight})`,
          height: component.style.height,
          overflow: component.style.overflow,
          margin: component.style.margin
        }
      }

      if ('marginLeft' in component.style) {
        dragCompStyle.style.marginLeft = component.style.marginLeft
      }

      if ('marginRight' in component.style) {
        dragCompStyle.style.marginRight = component.style.marginRight
      }

      // 但部分容器除外，这部分组件因为其内部有特殊处理，所以这里需要单独处理部分属性。
      if (componentDef.type !== 'a-image') {
        component.style = omit(component.style, ['width', 'height'])
      }

      // 布局组件需要添加额外的样式
      const canvasCompCategoryClassName = `tg-designer-${componentSchema.category}-component`

      // ========================================================================

      // 添加布局组件的嵌套支持
      if (isLayoutComp) {
        if (componentDef.canMoveInside) {
          designerStore.actionBar.canMoveInside[componentSchema.id] = componentDef.canMoveInside
        }

        if (componentDef.canCopyInside) {
          designerStore.actionBar.canCopyInside[componentSchema.id] = componentDef.canCopyInside
        }

        if (componentSchema.type === 'tg-layout-flex') {
          // 在画布中时，Flex布局组件的布局方向要应用到拖拽容器上，让画布呈现和预览呈现保持一致。
          dragCompStyle.style.flexDirection = componentSchema.props.vertical ? 'column' : 'row'
        }

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
          data-cell-position={componentSchema.cellPosition}
          draggable
          class={{
            [canvasCompCategoryClassName]: true, // tg-designer-layout-component
            'tg-designer-drag-component': true,
            'dragging': componentSchema.__dragging, // 拖动状态样式
            'component-enter-active': componentSchema.__animating && !componentSchema.__initialized,
            'component-leave-active': componentSchema.__animating && componentSchema.__initialized
          }}
          {...dragCompStyle}
          onClick={e => handleCompClick(e, componentSchema, componentDef)}
          onDragstart={e => handleCompDragStart(e, componentSchema)}
          onDragend={e => handleCompDragEnd(e, componentSchema)}
        >
          {componentDef.preview(component)}
        </div>
      )
    }

    return () => {
      const canvasStyle = styleWithUnits(schema.value.canvas.style)

      if (canvasStyle.width === '100%' && parseInt(canvasStyle.padding) < 3) {
        // 为了给画布的辅助线和指示线留出位置
        canvasStyle.padding = '3px'
      }

      return (
        <div class={'tg-designer-canvas-layout'}>
          <div
            ref={containerRef}
            {...omit(schema.value.canvas, ['class', 'style'])}
            data-selected={selectedComponent.value?.type === 'canvas'}
            class={[
              'tg-designer-canvas-container',
              { [schema.value.canvas.class]: true }
            ]}
            style={{
              ...canvasStyle,
              '--canvas-padding': canvasStyle?.padding || '15px',
              overflowY: designerStore.indicator.type === 'container' ? 'hidden' : 'auto'
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
