import { createStore } from '@/stores/createStore'
import configs from '@/configs'

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
      // 默认算法 defaultAlgorithm 暗色算法 darkAlgorithm
      algorithm: 'defaultAlgorithm',
      // 是否紧凑模式，默认 false。启用后，会在 antd 组件的布局算法中加入 'compactAlgorithm'。
      isCompactAlgorithm: false,
      // 组件大小，默认 middle，可选 small | middle | large
      componentSize: 'middle'
    },
    actions: {
      setCollapsed() {
        this.collapsed = !this.collapsed
      },
      setTheme(appName, userInfo) {
        const state = {
          themeName: userInfo.themeFileName || this.themeName || configs.header.buttons.theme.default,
          // collapsed: userInfo.collapsed || this.collapsed,
          // treeCollapsed: userInfo.treeCollapsed || this.treeCollapsed,
          fontSize: userInfo.fontSize || this.fontSize,
          algorithm: userInfo.algorithm || this.algorithm,
          isCompactAlgorithm: userInfo.isCompactAlgorithm
            ? userInfo.isCompactAlgorithm === '1'
            : this.isCompactAlgorithm,
          componentSize: userInfo.componentSize || this.componentSize
        }

        localStorage.setItem(`${appName}-theme`, state.themeName)

        this.$patch(state)
      }
    }
  },
  excludeFromState: true,
  isRoot: true
})
