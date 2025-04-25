import { onMounted, ref } from 'vue'
import { styleWithUnits } from '../../utils/style'
import { useEditorStore } from '../../stores/useEditorStore'
import './assets/styles/index.scss'
import { TG_MATERIAL_CATEGORY } from '@/components/TGDesigner/materials'

export default {
  name: 'Preview',
  setup() {
    const store = useEditorStore()
    const schema = ref(null)

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
        previewType: 'preview',
        style: styleWithUnits(componentSchema.props?.style ?? {})
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
      const previewSchema = JSON.parse(sessionStorage.getItem('tg-schemas') || '{}')
      schema.value = previewSchema.default
    })

    return () => (
      <div class="tg-preview-wrapper">
        <div
          class="tg-preview-container"
          style={styleWithUnits(schema.value?.canvas?.style ?? {})}
        >
          {schema.value?.components?.map(renderPreviewFromSchema)}
        </div>
      </div>
    )
  }
}
