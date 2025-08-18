import { useEditorStore } from '@/components/TGDesigner/stores/useEditorStore'
import { computed, defineAsyncComponent, onMounted } from 'vue'

/**
 * 设计器插件定义
 * @typedef {Object} DesignerPlugin
 * @property {string} name - 插件名称
 * @property {string} icon - 插件图标
 * @property {import('vue').Component} panel - 插件面板
 * @global
 */

/**
 * 设计器工具定义
 * @typedef {Object} DesignerTool
 * @property {string} name - 工具名称
 * @property {string} icon - 工具图标
 * @property {()=>void} onClick - 点击事件
 * @global
 */

/**
 * @typedef {Object} BuiltInPlugins
 * @property {DesignerPlugin} [__MATERIALS__] - 物料插件
 * @property {DesignerPlugin} [__TEMPLATES__] - 模板插件
 * @property {DesignerPlugin} [__DATA__] - 数据插件
 * @property {DesignerPlugin} [__PAGES__] - 页面插件
 * @property {DesignerPlugin} [__PREVIEW__] - 预览插件
 * @global
 * @see PLUGIN_KEY
 */

/**
 * 插件集合类型（支持内置键和扩展键，扩展键也需要使用Symbol类型）
 * @typedef {BuiltInPlugins & { [key: Symbol]: DesignerPlugin }} DesignerPlugins
 */

/**
 * 插件集合类型（支持内置键和扩展键，扩展键也需要使用Symbol类型）
 * @typedef {BuiltInPlugins & { [key: Symbol]: DesignerTool }} DesignerTools
 */

/**
 * @typedef {Object} DesignerPluginsAndTools
 * @property {DesignerPlugins} plugins - 插件列表
 * @property {DesignerTools} tools - 工具列表
 */

/**
 * 内置插件标识。外部定义插件时调用该key可以重写对应的内置插件，否则将作为全新的插件加入设计器中。
 * @type {freeze<BuiltInPlugins>}
 * @readonly
 */
export const PLUGIN_KEY = Object.freeze({
  __MATERIALS__: Symbol('materials'),
  __TEMPLATES__: Symbol('templates'),
  __DATA__: Symbol('data'),
  __PAGES__: Symbol('pages'),
  __PREVIEW__: Symbol('preview')
})

export default {
  name: 'Plugins',
  props: {
    plugins: {
      /**
       * 插件配置（支持对象或工厂函数）
       * @type {import('vue').PropType<DesignerPlugins>}
       */
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { expose }) {
    const store = useEditorStore()
    const selectedPlugin = computed(() => store.selectedPlugin)
    /**
     * 插件列表
     * @type {DesignerPlugins}
     */
    const plugins = {
      [PLUGIN_KEY.__MATERIALS__]: {
        name: '物料',
        icon: 'icon-designer-materials',
        panel: defineAsyncComponent(() => import('./MaterialPanel'))
      },
      [PLUGIN_KEY.__TEMPLATES__]: {
        name: '模板',
        icon: 'icon-designer-templates',
        panel: defineAsyncComponent(() => import('./TemplatePanel'))
      },
      [PLUGIN_KEY.__DATA__]: {
        name: '数据',
        icon: 'icon-designer-data',
        panel: defineAsyncComponent(() => import('./DataPanel'))
      },
      [PLUGIN_KEY.__PAGES__]: {
        name: '页面',
        icon: 'icon-designer-pages',
        panel: defineAsyncComponent(() => import('./PagePanel'))
      },
      ...props.plugins
    }

    onMounted(() => {
      // 设置默认选中的插件
      store.selectedPlugin.key = PLUGIN_KEY.__MATERIALS__
    })

    expose({
      getPluginContent: () => {
        return plugins[selectedPlugin.value.key].panel || null
      }
    })

    return () => (
      <div class={'tg-designer-plugins-content'}>
        {
          Reflect.ownKeys(plugins).map(pluginKey => (
            <div
              key={pluginKey}
              class={{
                'tg-designer-plugin': true,
                'selected': pluginKey === selectedPlugin.value.key
              }}
              onClick={() => store.selectedPlugin.key = pluginKey}
            >
              <IconFont type={plugins[pluginKey].icon} />
              <div>{plugins[pluginKey].name}</div>
            </div>
          ))
        }
      </div>
    )
  }
}
