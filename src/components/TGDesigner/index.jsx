import Canvas from './components/Canvas'
import PropertyPanel from './components/PropertyPanel'
import { Layout, Spin } from 'ant-design-vue'
import Header from './components/Header'
import Plugins, { PLUGIN_KEY } from './components/Plugins'
import { computed, markRaw, onMounted, provide, ref, watch } from 'vue'
import { useEditorStore } from '@/components/TGDesigner/stores/useEditorStore'
import './assets/styles/index.scss'

export default {
  name: 'TGDesigner',
  props: {
    tgStore: {
      required: true,
      type: Object
    }
  },
  setup(props) {
    provide('tgStore', props.tgStore)

    const pluginRef = ref(null)
    const headerRef = ref(null)
    let CurrentPluginComponent = ref(<div>加载中...</div>)
    const asyncComponentProps = ref({})
    const designerStore = useEditorStore()
    const { tgStore } = props
    const schema = computed(() => designerStore.schema)
    const loading = computed(() => tgStore.loading)
    const pluginId = computed(() => designerStore.selectedPlugin.id)
    const search = computed(() => tgStore.search)

    // 动态加载插件组件
    watch(pluginId, val => {
      if (val) {
        if (val === PLUGIN_KEY.TEMPLATES) {
          asyncComponentProps.value = { updateSchema: headerRef.value.updateSchema }
        }

        CurrentPluginComponent.value = markRaw(pluginRef.value.getPluginContent())
      }
    })

    // 初始化画布
    onMounted(async () => {
      // 从后台获取schema
      const res = await tgStore.getDetails({
        params: search.value.pageType === 13
          ? {
            configPageId: search.value.pageId,
            pageType: search.value.pageType
          }
          : {
            configId: search.value.sceneConfigId,
            pageType: search.value.pageType
          },
        apiName: 'getSchema'
      })

      if (res.status) {
        search.value.schemaId = res.data.id

        if (res.data?.schemaContent) {
          designerStore.schema = JSON.parse(res.data.schemaContent)
        } else {
          // 当本页面不存在已保存的schema数据时，立即保存一次，以初始化数据
          await tgStore.fetch({
            loading: false,
            apiName: 'updateSchema',
            params: {
              scenePageSchemaId: search.value.schemaId,
              schemaContent: JSON.stringify(schema.value)
            }
          })
        }
      }
    })

    return () => (
      <Layout class={'tg-designer-container'}>
        <Spin spinning={loading.value}>
          <Layout class={'tg-designer-header'}>
            <Header ref={headerRef} />
          </Layout>

          <Layout>
            <Layout.Sider
              width={68}
              class={'tg-designer-plugins-wrapper'}
            >
              <Plugins ref={pluginRef} />
            </Layout.Sider>
            <Layout>
              <Layout.Sider
                width={220}
                theme="light"
                class={'tg-designer-plugin-content-wrapper'}
              >
                <CurrentPluginComponent.value {...asyncComponentProps.value} />
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
