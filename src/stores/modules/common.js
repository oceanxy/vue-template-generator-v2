import { createStore } from '@/stores/createStore'

export default createStore({
  moduleName: 'common',
  module: {
    state: {
      // 菜单栏折叠与展开状态切换
      collapsed: false,
      // 是否显示系统菜单
      showMenu: true,
      // 页面中的侧边树折叠与展开状态切换（如果有）
      treeCollapsed: false,
      // 页面中的搜索栏折叠与展开状态切换（如果有）
      inquiryFormCollapsed: true,
      // 主题配置
      themeName: 'default'
    },
    actions: {
      setCollapsed() {
        this.collapsed = !this.collapsed
      }
    }
  },
  excludeFromState: true,
  isRoot: true
})
