import { TG_COMPONENT_CATEGORY } from '@/components/TGEditor/templateComponents'
import { useEditorStore } from '../stores/useEditorStore'
import useDragDrop from '@/components/TGEditor/hooks/useDragDrop'

export default {
  name: 'TGEditorMaterialPanel',
  setup() {
    const store = useEditorStore()
    const { handleDragStart } = useDragDrop()
    const materials = [
      {
        category: TG_COMPONENT_CATEGORY.LAYOUT,
        title: '布局组件',
        components: store.components[TG_COMPONENT_CATEGORY.LAYOUT]
      },
      {
        category: TG_COMPONENT_CATEGORY.BASIC,
        title: '基础组件',
        components: store.components[TG_COMPONENT_CATEGORY.BASIC]
      },
      {
        category: TG_COMPONENT_CATEGORY.TEMPLATE,
        title: '模板组件',
        components: store.components[TG_COMPONENT_CATEGORY.TEMPLATE]
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
                        {comp.preview({ ...comp.defaultProps, style: comp.style })}
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
