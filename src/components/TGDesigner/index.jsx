import Canvas from './components/Canvas'
import MaterialPanel from './components/MaterialPanel'
import PropertyPanel from './components/PropertyPanel'
import { Layout, Spin } from 'ant-design-vue'
import Header from './components/Header'
import { computed, onMounted, provide } from 'vue'
import './assets/styles/index.scss'
import { useEditorStore } from '@/components/TGDesigner/stores/useEditorStore'

export default {
  name: 'TGDesigner',
  props: {
    tgStore: {
      required: true,
      type: Object
    },
    apiNameForGetTemplate: String,
    apiNameForGetTemplates: String,
    getSchemaById: String,
    updateSchema: String,
    setTemplateId: String
  },
  setup(props) {
    provide('tgStore', props.tgStore)
    provide('apiNameForGetTemplate', props.apiNameForGetTemplate)
    provide('apiNameForGetTemplates', props.apiNameForGetTemplates)
    provide('updateSchema', props.updateSchema)
    provide('setTemplateId', props.setTemplateId)

    const designerStore = useEditorStore()
    const { tgStore } = props
    const schema = computed(() => designerStore.schema)
    const loading = computed(() => tgStore.loading)

    onMounted(async () => {
      // 从后台获取schema
      const res = await tgStore.getDetails({
        params: {
          pageId: tgStore.search.pageId,
          sceneId: tgStore.search.sceneId
        },
        apiName: props.getSchemaById
      })

      if (res.status) {
        if (res.data.schema) {
          designerStore.schema = JSON.parse(res.data.schema)
        }

        if (res.data.id) {
          tgStore.search.id = res.data.id
        } else {
          // 当本页面不存在已保存的schema数据时，立即保存一次，以初始化数据
          const res = await tgStore.fetch({
            loading: false,
            apiName: props.updateSchema,
            params: {
              sceneId: tgStore.search.sceneId,
              pageId: tgStore.search.pageId,
              schema: JSON.stringify(schema.value)
            }
          })

          if (res.status) {
            tgStore.search.id = res.data.id
          }
        }
      }
    })

    return () => (
      <Layout class={'tg-designer-container'}>
        <Spin spinning={loading.value}>
          <Layout class={'tg-designer-header'}>
            <Header />
          </Layout>

          <Layout>
            <Layout.Sider
              width={68}
              class={'tg-designer-plugins-wrapper'}
            >
              <div class={'tg-designer-plugin selected'}>
                <IconFont type="icon-designer-materials" />
                <div>物料</div>
              </div>
              <div class={'tg-designer-plugin'}>
                <IconFont type="icon-designer-data" />
                <div>数据</div>
              </div>
              <div class={'tg-designer-plugin'}>
                <IconFont type="icon-designer-pages" />
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
        </Spin>
      </Layout>
    )
  }
}
