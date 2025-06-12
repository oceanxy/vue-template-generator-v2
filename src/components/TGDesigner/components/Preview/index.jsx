import { onMounted, ref, watch } from 'vue'
import { styleWithUnits } from '../../utils/style'
import { useEditorStore } from '../../stores/useEditorStore'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import { useRoute } from 'vue-router'
import { SchemaService } from '@/components/TGDesigner/schemas/persistence'
import './assets/styles/index.scss'

export default {
  name: 'Preview',
  props: {
    previewType: {
      type: String,
      default: 'preview'
    },
    schema: {
      type: String,
      default: '{}'
    }
  },
  setup(props) {
    const store = useEditorStore()
    const schema = ref(null)
    const route = useRoute()

    const renderPreviewFromSchema = (componentSchema, parentId = null) => {
      const componentDef = store.getComponentByType(
        componentSchema.type,
        componentSchema.category
      )

      if (!componentDef) return null

      // 初始化组件props
      const component = {
        key: componentSchema.id,
        ...componentSchema.props,
        previewType: props.previewType,
        class: componentDef.class,
        style: styleWithUnits(componentSchema.props?.style ?? {}),
        'data-cell-position': componentSchema.cellPosition
      }

      // 添加布局组件的嵌套支持
      if (componentSchema.category === TG_MATERIAL_CATEGORY.LAYOUT) {
        component.children = componentSchema.children?.map(childSchema =>
          renderPreviewFromSchema(childSchema, componentSchema.id)
        ) ?? []
      }

      return componentDef.preview(component)
    }

    onMounted(() => {
      if (props.previewType === TG_MATERIAL_PREVIEW_TYPE.PREVIEW) {
        schema.value = SchemaService.load(route.query.schemaId)
      } else if (props.previewType === TG_MATERIAL_PREVIEW_TYPE.PORTAL) {
        watch(
          () => props.schema,
          newSchema => {
            schema.value = JSON.parse(newSchema)
          },
          { immediate: true }
        )
      }
    })

    return () => (
      <div class="tg-preview-wrapper">
        <div
          class={{
            'tg-preview-container': true,
            'tg-preview-designer-container': !!route.params.sceneConfigId
          }}
          style={styleWithUnits(schema.value?.canvas?.style ?? {})}
        >
          {schema.value?.components?.map(renderPreviewFromSchema)}
        </div>
      </div>
    )
  }
}
