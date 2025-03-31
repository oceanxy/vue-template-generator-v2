import { TG_COMPONENT_CATEGORY } from '@/components/TGEditor/templateComponents'
import { useEditorStore } from '../stores/useEditorStore'

export default {
  name: 'MaterialPanel',
  props: ['schema', 'handleDragStart'],
  setup(props) {
    const store = useEditorStore()
    const materials = [
      {
        category: TG_COMPONENT_CATEGORY.LAYOUT,
        title: '布局组件',
        components: store.layoutComponents
      },
      {
        category: TG_COMPONENT_CATEGORY.BASIC,
        title: '基础组件',
        components: store.basicComponents
      },
      {
        category: TG_COMPONENT_CATEGORY.TEMPLATE,
        title: '模板组件',
        components: store.templateComponents
      }
    ]

    const handleMaterialDragStart = (e, component) => {
      store.selectedComponent = null

      e.dataTransfer.setData('componentType', component.type)
      e.dataTransfer.effectAllowed = 'copy' // 区别于内部的 'move'

      props.handleDragStart(e, component)
    }

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
                        onDragstart={(e) => handleMaterialDragStart(e, comp)}
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
