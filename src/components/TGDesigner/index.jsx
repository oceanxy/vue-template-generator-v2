import './assets/styles/index.scss'
import Canvas from './components/Canvas'
import MaterialPanel from './components/MaterialPanel'
import PropertyPanel from './components/PropertyPanel'
import { Layout } from 'ant-design-vue'
import Header from './components/Header'
import { AppstoreOutlined, DatabaseOutlined, FileOutlined } from '@ant-design/icons-vue'

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
            width={68}
            class={'tg-designer-plugins-wrapper'}
          >
            <div class={'tg-designer-plugin selected'}>
              <IconFont type='icon-designer-materials' />
              <div>物料</div>
            </div>
            <div class={'tg-designer-plugin'}>
              <IconFont type='icon-designer-data' />
              <div>数据</div>
            </div>
            <div class={'tg-designer-plugin'}>
              <IconFont type='icon-designer-pages' />
              <div>页面</div>
            </div>
          </Layout.Sider>
          <Layout>
            <Layout.Sider
              width={220}
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
      </Layout>
    )
  }
}
