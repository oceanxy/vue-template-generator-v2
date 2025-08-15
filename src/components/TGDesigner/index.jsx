import Canvas from './components/Canvas'
import PropertyPanel from './components/PropertyPanel'
import { Layout, message, Spin } from 'ant-design-vue'
import Header from './components/Header'
import Plugins, { PLUGIN_KEY } from './components/Plugins'
import { computed, markRaw, onMounted, provide, ref, watch } from 'vue'
import { useEditorStore } from '@/components/TGDesigner/stores/useEditorStore'
import { SAVE_STATUS } from '@/components/TGDesigner/configs/enums'
import { SchemaService } from '@/components/TGDesigner/schemas/persistence'
import './assets/styles/index.scss'

export default {
  name: 'TGDesigner',
  props: {
    tgStore: {
      required: true,
      type: Object
    },
    // 自定义属性面板上传图片组件
    propPanelCustomUpload: {
      /**
       * 属性面板上传图片专用的上传组件
       * @type {import('vue').PropType<import('vue').Component>}
       */
      type: Object,
      default: () => null
    },
    ...Plugins.props
  },
  setup(props) {
    provide('propPanelCustomUpload', props.propPanelCustomUpload)
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
        tgStore.search.schemaId = res.data.id
        tgStore.search.templateId = res.data.pageTemplateId
        sessionStorage.setItem('tg-designer-template-id', res.data.pageTemplateId)

        if (res.data?.schemaContent) {
          designerStore.schema = JSON.parse(res.data.schemaContent)
          SchemaService.save(search.value.schemaId, designerStore.schema)
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
          // 同时执行本地缓存
          SchemaService.save(search.value.schemaId, schema.value)
        }

        tgStore.isSchemaLoaded = true
        tgStore.saveStatus = SAVE_STATUS.SAVED
      } else {
        // 如果服务暂时无法获取，则临时从本地缓存中恢复schema（如果本地存在缓存）
        let localSchema = SchemaService.load(search.value.schemaId)

        if (localSchema) {
          designerStore.schema = localSchema
          tgStore.isSchemaLoaded = true
        } else {
          // 服务无法连接，本地也无已缓存的schema时，提示异常
          message.error('无法获取服务，您所有的操作都不会被保存，请刷新页面重试。如果持续出现异常，请联系系统管理员处理。')
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
