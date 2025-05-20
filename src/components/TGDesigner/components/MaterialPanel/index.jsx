import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import { useEditorStore } from '../../stores/useEditorStore'
import useDragDrop from '@/components/TGDesigner/hooks/useDragDrop'
import { styleWithUnits } from '@/components/TGDesigner/utils/style'
import { Geometry } from '@/components/TGDesigner/utils/geometry'
import { Popover } from 'ant-design-vue'
import { ref } from 'vue'
import './index.scss'

export default {
  name: 'TGDesignerMaterialPanel',
  setup() {
    const popoverStates = ref({})
    const store = useEditorStore()
    const { handleDragStart } = useDragDrop()
    const materials = [
      {
        category: TG_MATERIAL_CATEGORY.LAYOUT,
        title: '布局部件',
        components: store.components[TG_MATERIAL_CATEGORY.LAYOUT]
      },
      {
        category: TG_MATERIAL_CATEGORY.BASIC,
        title: '基础部件',
        components: store.components[TG_MATERIAL_CATEGORY.BASIC]
      },
      {
        category: TG_MATERIAL_CATEGORY.TEMPLATE,
        title: '模板部件',
        components: store.components[TG_MATERIAL_CATEGORY.TEMPLATE]
      }
    ]

    const getPopoverState = (compType) => {
      if (!popoverStates.value[compType]) {
        popoverStates.value[compType] = false
      }

      return popoverStates.value[compType]
    }

    const handleMaterialDragStart = (e, comp) => {
      // 关闭当前组件的 Popover
      popoverStates.value[comp.type] = false

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
                <div class="tg-designer-material-items">
                  {
                    material.components?.length
                      ? material.components.map(comp => (
                        <Popover
                          key={comp.type}
                          placement="right"
                          open={getPopoverState(comp.type)}
                          onOpenChange={v => popoverStates.value[comp.type] = v}
                        >
                          {{
                            default: () => (
                              <div
                                key={comp.type}
                                class={'tg-designer-material-item'}
                                draggable
                                onDragstart={(e) => handleMaterialDragStart(e, comp)}
                              >
                                {
                                  comp.preview({
                                    ...comp.defaultProps,
                                    style: {
                                      ...styleWithUnits(comp.defaultProps?.style ?? {}),
                                      ...styleWithUnits(comp.style || {})
                                    },
                                    previewType: TG_MATERIAL_PREVIEW_TYPE.MATERIAL
                                  })
                                }
                                <div class={'tg-designer-material-item-name'}>{comp.name}</div>
                              </div>
                            ),
                            content: () => (
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  minWidth: '100px',
                                  maxWidth: '800px',
                                  maxHeight: '520px',
                                  overflow: 'auto',
                                  zoom: comp.category === TG_MATERIAL_CATEGORY.TEMPLATE ? .7 : 1
                                }}
                              >
                                {
                                  comp.preview({
                                      ...comp.defaultProps,
                                      style: {
                                        ...styleWithUnits(comp.defaultProps?.style ?? {}),
                                        ...styleWithUnits(comp.style || {})
                                      },
                                      previewType: TG_MATERIAL_PREVIEW_TYPE.MATERIAL_PREVIEW
                                    }
                                  )
                                }
                              </div>
                            )
                          }}
                        </Popover>
                      ))
                      : <div>暂无组件</div>
                  }
                </div>
              </div>
            ))
          }
        </div>
      )
    }
  }
}
