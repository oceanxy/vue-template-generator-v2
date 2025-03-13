import UpdatePassword from '@app/views/Accounts/components/ModalForChangePassword'

export default {
  install(app) {
    // 注册全局弹窗组件
    app.config.globalProperties.GlobalUpdatePassword = UpdatePassword
  }
}
