import { TG_COMPONENT_CATEGORY } from '@/components/TGEditor/templateComponents'
import { useEditorStore } from '../stores/useEditorStore'

export default {
  name: 'MaterialPanel',
  props: ['schema', 'handleDragStart'],
  setup(props) {
    const store = useEditorStore()
    const materials = [
      {
        category: TG_COMPONENT_CATEGORY.layout,
        title: '布局组件',
        components: store.layoutComponents
      },
      {
        category: TG_COMPONENT_CATEGORY.base,
        title: '基础组件',
        components: store.basicComponents
      },
      {
        category: TG_COMPONENT_CATEGORY.template,
        title: '模板组件',
        components: store.templateComponents
      }
    ]

    return () => {
      return (
        <div class={'tg-editor-material-container'}>
          {
            materials.map(material => (
              <div
                key={material.category} class={{
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
                        onDragstart={(e) => props.handleDragStart(e, comp)}
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
