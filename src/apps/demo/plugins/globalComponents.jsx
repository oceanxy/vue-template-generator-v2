import { defineAsyncComponent } from 'vue'

export default {
  install(app) {
    // 注册全局弹窗组件
    app.config.globalProperties.userFunctions = {
      name: 'UserFunctions',
      setup() {
        const GlobalUpdatePassword = defineAsyncComponent(() => import('../components/GlobalUpdatePassword'))

        return () => [<GlobalUpdatePassword />]
      }
    }
  }
}
