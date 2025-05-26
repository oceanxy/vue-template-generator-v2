import Canvas from './components/Canvas'
import PropertyPanel from './components/PropertyPanel'
import { Layout, Spin } from 'ant-design-vue'
import Header from './components/Header'
import Plugins, { PLUGIN_KEY } from './components/Plugins'
import { computed, markRaw, onMounted, provide, ref, watch } from 'vue'
import { useEditorStore } from '@/components/TGDesigner/stores/useEditorStore'
import './assets/styles/index.scss'
import { SAVE_STATUS } from '@/components/TGDesigner/configs/enums'

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

    let CurrentPluginComponent = ref(<div>加载中...</div>)

    const pluginRef = ref(null)
    const headerRef = ref(null)
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

    // 初始化画布schema
    onMounted(async () => {
      // 【性能优化】先从本地恢复schema
      let localSchema = sessionStorage.getItem('tg-schemas')

      if (localSchema) {
        localSchema = Object.entries(JSON.parse(localSchema || '{}'))
        designerStore.schema = localSchema[0][1]
        tgStore.search.schemaId = localSchema[0][0]
        tgStore.isSchemaLoaded = true
      } else {
        // 如果本地没有缓存schema，则从后台获取schema
        const res = await tgStore.getDetails({
          apiName: 'getSchema',
          params: search.value.pageType === 13
            ? {
              configPageId: search.value.pageId,
              pageType: search.value.pageType
            }
            : {
              configId: search.value.sceneConfigId,
              pageType: search.value.pageType
            }
        })

        if (res.status) {
          tgStore.isSchemaLoaded = true
          tgStore.search.schemaId = res.data.id
          tgStore.search.templateId = res.data.templateId

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

          tgStore.saveStatus = SAVE_STATUS.SAVED
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
