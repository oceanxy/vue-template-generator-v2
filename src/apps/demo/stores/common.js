import { createStore } from '@/stores/createStore'

export default createStore({
  moduleName: 'common',
  module: {
    state: {
      // 全局修改密码弹窗的显示状态
      showModalForChangePassword: false,
      modalForChangePassword: {}
    }
  },
  excludeFromState: true
})

