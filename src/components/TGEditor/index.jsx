import './assets/styles/index.scss'
import { reactive } from 'vue'
import Canvas from './components/Canvas'
import { useStore } from './stores/useStore'
import { schema } from './schemas'
import { useDnD } from './utils/useDnD'
import { Button, Layout, Space } from 'ant-design-vue'

export default {
  name: 'TGEditor',
  setup() {
    const store = useStore()
    const _schema = reactive(schema)
    const { handleDragStart, handleDrop } = useDnD(_schema, store)

    return () => (
      <Layout class={'tg-editor-container'}>
        <Layout class={'tg-editor-header'}>
          <Space class={'tg-editor-tools'}>
            <Button>保存</Button>
          </Space>
        </Layout>
        <Layout>
          {/* 组件面板 */}
          <Layout.Sider
            width={200}
            theme="light"
            class={'tg-editor-component-container'}
          >
            <div class={'tg-editor-base-component'}>
              {
                store.componentList.map(comp => (
                  <div
                    key={comp.type}
                    class={'tg-editor-component-item'}
                    draggable
                    onDragstart={(e) => handleDragStart(e, comp)}
                  >
                    {comp.preview({ ...comp.defaultProps, style: comp.style })}
                  </div>
                ))
              }
            </div>
          </Layout.Sider>

          {/* 画布区域 */}
          <Layout.Content class={'tg-editor-canvas-wrapper'}>
            <div
              class={'tg-editor-canvas-container'}
              onDrop={handleDrop}
              onDragover={e => e.preventDefault()}
            >
              <Canvas schema={schema} />
            </div>
          </Layout.Content>
        </Layout>
      </Layout>
    )
  }
}
