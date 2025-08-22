import Canvas from './components/Canvas'
import PropertyPanel from './components/PropertyPanel'
import { Layout, message, Spin } from 'ant-design-vue'
import Header from './components/Header'
import Plugins, { PLUGIN_KEY } from './components/Plugins'
import { computed, markRaw, onMounted, provide, ref, watch } from 'vue'
import { useEditorStore } from '@/components/TGDesigner/stores/useEditorStore'
import { SchemaService } from '@/components/TGDesigner/schemas/persistence'
import { SAVE_STATUS } from '@/components/TGDesigner/configs/enums'
import './assets/styles/index.scss'

export default {
  name: 'TGDesigner',
  props: {
    schemaId: {
      /**
       * schema id
       * @type {import('vue').PropType<string>}
       */
      type: [String, null]
    },
    loading: {
      /**
       * 是否正在加载中
       * @type {import('vue').PropType<boolean>}
       */
      type: Boolean,
      default: false
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
    getSchemaApi: {
      /**
       * 获取schema
       * @type {import('vue').PropType<() => Promise<{id: string, schema: any}>>}
       */
      type: Function
    },
    updateSchemaApi: {
      /**
       * 更新schema
       * @type {import('vue').PropType<(schema: any) => Promise<{status: boolean}>>}
       */
      type: Function
    },
    plugins: {
      /**
       * 插件配置（支持对象或工厂函数）
       * @type {
       *  import('vue').PropType<
       *    DesignerPluginsAndTools |
       *    ((builtInPlugins: BuiltInPlugins) => DesignerPluginsAndTools)
       *  >
       * }
       */
      type: [Object, Function],
      default: () => ({})
    }
  },
  setup(props, { slots }) {
    provide('propPanelCustomUpload', props.propPanelCustomUpload)

    let CurrentPluginComponent = ref(<div>加载中...</div>)

    const pluginRef = ref(null)
    const headerRef = ref(null)
    const asyncComponentProps = ref({})
    const store = useEditorStore()
    const pluginId = computed(() => store.selectedPlugin.key)

    let tools = {}
    let plugins = typeof props.plugins === 'function'
      ? props.plugins(PLUGIN_KEY)
      : props.plugins

    // 确认插件列表的结构
    if (Reflect.ownKeys(plugins).some(key => typeof key !== 'symbol')) {
      tools = plugins.tools || {}
      plugins = plugins.plugins || {}
    }

    // 动态加载插件组件
    watch(pluginId, val => {
      if (val) {
        // 为插件准备props
        asyncComponentProps.value = {
          designerStore: store,
          updateSchema: headerRef.value.updateSchema
        }

        CurrentPluginComponent.value = markRaw(pluginRef.value.getPluginContent())
      }
    })

    // 初始化画布schema
    onMounted(async () => {
      let res

      if (typeof props.getSchemaApi === 'function') {
        res = await props.getSchemaApi()

        if (!res) {
          message.error('初始化失败！')
          throw new Error('未从“getSchemaApi”函数中获取到有效的schema数据！')
        }
      } else {
        // 未传递API时使用本地默认数据
        res = { id: '__BUILT_IN_ID__' }
      }

      if (res?.id) {
        if (res.schema) {
          store.schema = JSON.parse(res.schema)
        }

        SchemaService.save(res.id, store.schema)

        store.isSchemaLoaded = true
        store.saveStatus = SAVE_STATUS.SAVED
      }
    })

    return () => (
      <Layout class={'tg-designer-container'}>
        <Spin spinning={props.loading}>
          <Layout class={'tg-designer-header'}>
            <Header
              ref={headerRef}
              schemaId={props.schemaId}
              plugins={tools}
              updateSchemaApi={props.updateSchemaApi}
            >
              {{ logo: slots.logo }}
            </Header>
          </Layout>
          <Layout>
            <Layout.Sider
              width={68}
              class={'tg-designer-plugins-wrapper'}
            >
              <Plugins ref={pluginRef} plugins={plugins} />
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
