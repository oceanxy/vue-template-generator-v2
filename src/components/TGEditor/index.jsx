import './assets/styles/index.scss'
import { reactive, watch } from 'vue'
import Canvas from './components/Canvas'
import MaterialPanel from './components/MaterialPanel'
import PropertyPanel from './components/PropertyPanel'
import { useEditorStore } from './stores/useEditorStore'
import { schema as schemaMeta } from './schemas'
import { useDnD } from './utils/useDnD'
import { Button, Layout, message, Space } from 'ant-design-vue'
import { SchemaService } from './schemas/persistence'

export default {
  name: 'TGEditor',
  setup() {
    const store = useEditorStore()
    const schema = reactive(schemaMeta)
    const { handleDragStart, handleDrop } = useDnD(schema, store)

    watch(
      () => schema,
      val => {
        // 持久化schema
        SchemaService.save('default', val)
      },
      { deep: true, immediate: true }
    )

    const handleSchemaSave = () => {
      SchemaService.save('default', schema)
      message.success('保存成功')
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
              store={store}
              schema={schema}
              handleDragStart={handleDragStart}
            />
          </Layout.Sider>

          {/* 画布 */}
          <Layout.Content class={'tg-editor-canvas-wrapper'}>
            <Canvas
              store={store}
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
