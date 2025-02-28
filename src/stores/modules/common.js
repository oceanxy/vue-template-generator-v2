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
      // 主题配置，默认科技蓝
      themeName: 'tech-blue',
      // 字号设置，默认14
      fontSize: 14,
      // 默认算法 defaultAlgorithm 暗色算法 darkAlgorithm 紧凑算法 compactAlgorithm
      algorithm: 'defaultAlgorithm',
      // 组件大小，默认 middle，可选 small | middle | large
      componentSize: 'middle'
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
