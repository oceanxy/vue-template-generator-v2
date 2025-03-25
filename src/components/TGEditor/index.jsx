import './assets/styles/index.scss'
import { reactive, toRaw, watchEffect } from 'vue'
import Canvas from './components/Canvas'
import MaterialPanel from './components/MaterialPanel'
import PropertyPanel from './components/PropertyPanel'
import { useEditorStore } from './stores/useEditorStore'
import { schema as schemaMeta } from './schemas'
import { useDnD } from './utils/useDnD'
import { Button, Layout, message, Space } from 'ant-design-vue'
import { SchemaService } from './schemas/persistence'
import { cloneDeep, debounce } from 'lodash'

export default {
  name: 'TGEditor',
  setup() {
    const store = useEditorStore()
    const schema = reactive(cloneDeep(schemaMeta))
    const { handleDragStart, handleDrop } = useDnD(schema, store)

    const autoSave = debounce(async schema => {
      try {
        await SchemaService.save('default', toRaw(schema))
        // message.success('自动保存成功', 1)
      } catch (e) {
        // message.error(`自动保存失败：${e.message}`)
      }
    }, 500)

    watchEffect(() => {
      autoSave(schema)
    })

    const handleSchemaSave = () => {
      // todo 向服务端保存
    }

    // 更新组件的 Schema
    function updateComponentSchema(props) {
      const componentSchema = schema.components.find(component => component.id === store.selectedComponent.id)
      componentSchema.props = props
    }

    return () => (
      <Layout class={'tg-editor-container'}>
        <Layout class={'tg-editor-header'}>
          <Space class={'tg-editor-tools'}>
            <Button onClick={handleSchemaSave}>保存</Button>
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
