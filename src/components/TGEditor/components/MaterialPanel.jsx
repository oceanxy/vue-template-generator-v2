import { TG_MATERIAL_CATEGORY } from '@/components/TGEditor/materials'
import { useEditorStore } from '../stores/useEditorStore'
import useDragDrop from '@/components/TGEditor/hooks/useDragDrop'
import { styleWithUnits } from '@/components/TGEditor/utils/style'

export default {
  name: 'TGEditorMaterialPanel',
  setup() {
    const store = useEditorStore()
    const { handleDragStart } = useDragDrop()
    const materials = [
      {
        category: TG_MATERIAL_CATEGORY.LAYOUT,
        title: '布局组件',
        components: store.components[TG_MATERIAL_CATEGORY.LAYOUT]
      },
      {
        category: TG_MATERIAL_CATEGORY.BASIC,
        title: '基础组件',
        components: store.components[TG_MATERIAL_CATEGORY.BASIC]
      },
      {
        category: TG_MATERIAL_CATEGORY.TEMPLATE,
        title: '模板组件',
        components: store.components[TG_MATERIAL_CATEGORY.TEMPLATE]
      }
    ]

    return () => {
      return (
        <div class={'tg-editor-material-container'}>
          {
            materials.map(material => (
              <div
                key={material.category}
                class={{
                  'tg-editor-material-category': true,
                  [material.category]: true
                }}
              >
                <h4 class="tg-editor-material-title">{material.title}</h4>
                {
                  material.components?.length
                    ? material.components.map(comp => (
                      <div
                        key={comp.type}
                        class={'tg-editor-material-items'}
                        draggable
                        onDragstart={(e) => handleDragStart(e, comp)}
                      >
                        {/*{comp.icon}*/}
                        {
                          comp.preview({
                            ...comp.defaultProps,
                            style: {
                              ...styleWithUnits(comp.defaultProps?.style ?? {}),
                              ...styleWithUnits(comp.style || {})
                            },
                            previewType: 'material'
                          })
                        }
                      </div>
                    ))
                    : <div>暂无组件</div>
                }
              </div>
            ))
          }
        </div>
      )
    }
  }
}
