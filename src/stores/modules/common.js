import { createStore } from '@/stores/createStore'
import configs from '@/configs'

// 统一的屏幕检测函数
export function getScreenInfo() {
  const width = window.innerWidth

  if (width <= 1366) {
    return { fontSize: 12, componentSize: 'small' }
  } else if (width <= 1920) {
    return { fontSize: 14, componentSize: 'middle' }
  } else {
    return { fontSize: 16, componentSize: 'large' }
  }
}

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
      // 字号设置，根据屏幕尺寸自动设置默认值
      fontSize: getScreenInfo().fontSize,
      // 默认算法 defaultAlgorithm 暗色算法 darkAlgorithm
      algorithm: 'defaultAlgorithm',
      // 是否紧凑模式，默认 false。启用后，会在 antd 组件的布局算法中加入 'compactAlgorithm'。
      isCompactAlgorithm: false,
      // 组件大小，根据屏幕尺寸自动设置默认值，可选 small | middle | large
      componentSize: getScreenInfo().componentSize
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
      },
      updateScreenInfo() {
        const { fontSize, componentSize } = getScreenInfo()
        this.fontSize = fontSize
        this.componentSize = componentSize
      }
    }
  },
  excludeFromState: true,
  isRoot: true
})
