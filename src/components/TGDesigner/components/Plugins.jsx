import { useEditorStore } from '@/components/TGDesigner/stores/useEditorStore'
import { computed, defineAsyncComponent, onMounted } from 'vue'

export default {
  name: 'Plugins',
  setup(props, { expose }) {
    const store = useEditorStore()
    const selectedPlugin = computed(() => store.selectedPlugin)
    const plugins = [
      {
        key: 'plugin-materials',
        name: '物料',
        icon: 'icon-designer-materials'
      }, {
        key: 'plugin-templates',
        name: '模板',
        icon: 'icon-designer-templates'
      }, {
        key: 'plugin-data',
        name: '数据',
        icon: 'icon-designer-data'
      }, {
        key: 'plugin-pages',
        name: '页面',
        icon: 'icon-designer-pages'
      }
    ]

    onMounted(() => {
      // 设置默认选中的插件
      store.selectedPlugin.id = 'plugin-materials'
    })

    expose({
      getPluginContent: () => {
        const componentMap = {
          'plugin-materials': defineAsyncComponent(() => import('./MaterialPanel')),
          'plugin-templates': defineAsyncComponent(() => import('./TemplatePanel')),
          'plugin-data': defineAsyncComponent(() => import('./DataPanel')),
          'plugin-pages': defineAsyncComponent(() => import('./PagePanel'))
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
