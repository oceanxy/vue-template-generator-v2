import './assets/styles/index.scss'
import Canvas from './components/Canvas'
import MaterialPanel from './components/MaterialPanel'
import PropertyPanel from './components/PropertyPanel'
import { Layout } from 'ant-design-vue'
import Header from './components/Header'

export default {
  name: 'TGEditor',
  setup() {
    return () => (
      <Layout class={'tg-editor-container'}>
        <Layout class={'tg-editor-header'}>
          <Header />
        </Layout>

        <Layout>
          <Layout.Sider
            width={200}
            theme="light"
            class={'tg-editor-material-wrapper'}
          >
            <MaterialPanel />
          </Layout.Sider>

          <Layout.Content class={'tg-editor-canvas-wrapper'}>
            <Canvas />
          </Layout.Content>

          <Layout.Sider
            width={200}
            theme="light"
            class={'tg-editor-property-wrapper'}
          >
            <PropertyPanel />
          </Layout.Sider>
        </Layout>
      </Layout>
    )
  }
}
