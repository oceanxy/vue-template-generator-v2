import { TG_MATERIAL_CATEGORY } from '@/components/TGDesigner/materials'
import { useEditorStore } from '../stores/useEditorStore'
import useDragDrop from '@/components/TGDesigner/hooks/useDragDrop'
import { styleWithUnits } from '@/components/TGDesigner/utils/style'
import { Geometry } from '@/components/TGDesigner/utils/geometry'

export default {
  name: 'TGDesignerMaterialPanel',
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

    const handleMaterialDragStart = (e, comp) => {
      Geometry.createDragPreviewImage(e)
      handleDragStart(e, comp)

      e.stopPropagation()
    }

    return () => {
      return (
        <div class={'tg-designer-material-container'}>
          {
            materials.map(material => (
              <div
                key={material.category}
                class={{
                  'tg-designer-material-category': true,
                  [material.category]: true
                }}
              >
                <h4 class="tg-designer-material-title">{material.title}</h4>
                {
                  material.components?.length
                    ? material.components.map(comp => (
                      <div
                        key={comp.type}
                        class={'tg-designer-material-items'}
                        draggable
                        onDragstart={(e) => handleMaterialDragStart(e, comp)}
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
