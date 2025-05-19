import { useEditorStore } from '@/components/TGDesigner/stores/useEditorStore'
import { computed, defineAsyncComponent, onMounted } from 'vue'

/**
 * 插件列表
 * @type {{MATERIALS: string, TEMPLATES: string, DATA: string, PAGES: string}}
 */
export const PLUGIN_KEY = {
  MATERIALS: 'plugin-materials',
  TEMPLATES: 'plugin-templates',
  DATA: 'plugin-data',
  PAGES: 'plugin-pages'
}

export default {
  name: 'Plugins',
  setup(props, { expose }) {
    const store = useEditorStore()
    const selectedPlugin = computed(() => store.selectedPlugin)
    const plugins = [
      {
        key: PLUGIN_KEY.MATERIALS,
        name: '物料',
        icon: 'icon-designer-materials'
      }, {
        key: PLUGIN_KEY.TEMPLATES,
        name: '模板',
        icon: 'icon-designer-templates'
      }, {
        key: PLUGIN_KEY.DATA,
        name: '数据',
        icon: 'icon-designer-data'
      }, {
        key: PLUGIN_KEY.PAGES,
        name: '页面',
        icon: 'icon-designer-pages'
      }
    ]

    onMounted(() => {
      // 设置默认选中的插件
      store.selectedPlugin.id = PLUGIN_KEY.MATERIALS
    })

    expose({
      getPluginContent: () => {
        const componentMap = {
          [PLUGIN_KEY.MATERIALS]: defineAsyncComponent(() => import('./MaterialPanel')),
          [PLUGIN_KEY.TEMPLATES]: defineAsyncComponent(() => import('./TemplatePanel')),
          [PLUGIN_KEY.DATA]: defineAsyncComponent(() => import('./DataPanel')),
          [PLUGIN_KEY.PAGES]: defineAsyncComponent(() => import('./PagePanel'))
        }

        return componentMap[selectedPlugin.value.id] || null
      }
    })

    return () => (
      <div class={'tg-designer-plugins-content'}>
        {
          plugins.map(plugin => (
            <div
              key={plugin.key}
              class={{
                'tg-designer-plugin': true,
                'selected': plugin.key === selectedPlugin.value.id
              }}
              onClick={() => store.selectedPlugin.id = plugin.key}
            >
              <IconFont type={plugin.icon} />
              <div>{plugin.name}</div>
            </div>
          ))
        }
      </div>
    )
  }
}
