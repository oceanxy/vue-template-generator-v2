import './assets/styles/index.scss'
import { reactive, ref, toRaw, watch, watchEffect } from 'vue'
import Canvas from './components/Canvas'
import MaterialPanel from './components/MaterialPanel'
import PropertyPanel from './components/PropertyPanel'
import { useEditorStore } from './stores/useEditorStore'
import { schema as schemaMeta } from './schemas'
import { useDnD } from './utils/useDnD'
import { Button, Layout, message, Space } from 'ant-design-vue'
import { cloneDeep, debounce } from 'lodash'
import { SchemaService } from '@/components/TGEditor/schemas/persistence'

export default {
  name: 'TGEditor',
  setup() {
    const isSaving = ref(false)
    const store = useEditorStore()
    const schema = reactive(cloneDeep(schemaMeta))
    const { handleDragStart, handleDrop } = useDnD(schema, store)

    const autoSave = debounce(
      async () => {
        try {
          isSaving.value = true
          await SchemaService.save('default', toRaw(schema))
        } catch (e) {
          message.error('保存失败')
        } finally {
          isSaving.value = false
        }
      },
      1500, // 自动保存时间间隔
      {
        leading: false,   // 不立即执行首次
        trailing: true    // 保证最后一次触发会执行
      }
    )

    // 关键操作立即保存（如组件删除/顺序变更）
    watch(() => schema.components.length, autoSave) // 组件数量变化立即触发
    watch(() => schema.canvas, autoSave, { deep: true }) // 画布设置变更立即触发

    // 在页面卸载前强制保存
    window.addEventListener('beforeunload', () => {
      autoSave.flush()
    })

    watchEffect(() => {
      autoSave()
    })

    const handleSchemaSave = () => {
      // todo 向服务端保存
    }

    // 更新组件的 Schema
    function updateComponentSchema(props) {
      if (store.selectedComponent?.type === 'canvas') {
        // 更新画布属性
        Object.assign(schema.canvas, props)
      } else {
        // 原有组件更新逻辑
        const componentSchema = schema.components.find(c => c.id === store.selectedComponent?.id)
        if (componentSchema) componentSchema.props = props
      }
    }

    const handleAction = debounce((action) => {
      /**
       * @type {TGComponentMeta}
       */
      const component = store.selectedComponent
      const currentIndex = schema.components.findIndex(c => c.id === component.id)
      let newComponentSchema = null

      if (currentIndex === -1) return

      if (action === 'copy') {
        newComponentSchema = store.createComponentSchema(component, schema.components[currentIndex])
      }

      switch (action) {
        case 'delete':
          schema.components = schema.components.filter(c => c.id !== component.id)
          store.selectedComponent = null
          break
        case 'copy':
          schema.components.splice(currentIndex + 1, 0, newComponentSchema)
          store.updateComponent({
            id: newComponentSchema.id,
            type: component.type,
            category: component.category
          })
          break
        case 'up':
          if (currentIndex > 0) {
            [schema.components[currentIndex], schema.components[currentIndex - 1]] =
              [schema.components[currentIndex - 1], schema.components[currentIndex]]

            store.updateComponent({
              id: component.id,
              type: component.type,
              category: component.category
            })
          }
          break
        case 'down':
          if (currentIndex < schema.components.length - 1) {
            [schema.components[currentIndex], schema.components[currentIndex + 1]] =
              [schema.components[currentIndex + 1], schema.components[currentIndex]]

            store.updateComponent({
              id: component.id,
              type: component.type,
              category: component.category
            })
          }
          break
        default:
          break
      }
    }, 50)

    return () => (
      <Layout class={'tg-editor-container'}>
        <Layout class={'tg-editor-header'}>
          <Space class={'tg-editor-tools'}>
            <Button
              onClick={handleSchemaSave}
              data-saving={isSaving.value ? 'true' : null}
            >
              保存
            </Button>
            {
              isSaving.value && (
                <div class="save-status-bar">
                  <div class="save-progress" />
                </div>
              )
            }
          </Space>
        </Layout>
        <Layout>
          {/* 组件面板 */}
          <Layout.Sider
            width={200}
            theme="light"
            class={'tg-editor-material-wrapper'}
          >
            <MaterialPanel
              schema={schema}
              handleDragStart={handleDragStart}
            />
          </Layout.Sider>

          {/* 画布 */}
          <Layout.Content class={'tg-editor-canvas-wrapper'}>
            <Canvas
              schema={schema}
              handleDrop={handleDrop}
              onActionTrigger={handleAction}
            />
          </Layout.Content>

          {/* 属性面板 */}
          <Layout.Sider
            width={200}
            theme="light"
            class={'tg-editor-property-wrapper'}
          >
            <PropertyPanel
              schema={schema}
              selectedComponent={store.selectedComponent}
              onUpdate={updateComponentSchema}
            />
          </Layout.Sider>
        </Layout>
      </Layout>
    )
  }
}
