import { defineStore } from 'pinia'

export const useCommonStore = defineStore('common', {
  state: () => ({
    // 菜单栏折叠与展开状态切换
    collapsed: false,
    // 是否显示系统菜单
    showMenu: true,
    // 页面中的侧边树折叠与展开状态切换（如果有）
    treeCollapsed: false,
    // 登录用户信息
    userInfo: {
      nickName: 'adminOne',
      fullName: 'admin',
      loginName: 'adminOne'
    },
    // 主题配置
    themeName: 'default',
    loading: false
  }),
  actions: {
    setCollapsed() {
      this.collapsed = !this.collapsed
    }
  }
})
