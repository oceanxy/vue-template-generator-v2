import './assets/styles/index.scss'
import Canvas from './components/Canvas'
import MaterialPanel from './components/MaterialPanel'
import PropertyPanel from './components/PropertyPanel'
import { Layout } from 'ant-design-vue'
import Header from './components/Header'

export default {
  name: 'TGDesigner',
  setup() {
    return () => (
      <Layout class={'tg-designer-container'}>
        <Layout class={'tg-designer-header'}>
          <Header />
        </Layout>

        <Layout>
          <Layout.Sider
            width={300}
            theme="light"
            class={'tg-designer-material-wrapper'}
          >
            <MaterialPanel />
          </Layout.Sider>

          <Layout.Content class={'tg-designer-canvas-wrapper'}>
            <Canvas />
          </Layout.Content>

          <Layout.Sider
            width={300}
            theme="light"
            class={'tg-designer-property-wrapper'}
          >
            <PropertyPanel />
          </Layout.Sider>
        </Layout>
      </Layout>
    )
  }
}
