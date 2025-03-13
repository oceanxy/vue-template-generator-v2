import { createStore } from '@/stores/createStore'

export default createStore({
  moduleName: 'accounts',
  module: {
    state: {
      search: {
        allLeaf: 1,
        status: '',
        fullName: undefined
      },
      modalForEditing: {
        loading: false,
        form: {
          fullName: null,
          gender: null,
          loginName: null,
          loginPwd: null,
          tel: null,
          email: null,
          qq: null,
          sortIndex: null,
          status: null
        }
      },
      showModalForChangePassword: false,
      modalForChangePassword: {
        loading: false,
        form: {
          pwd: undefined
        }
      }
    }
  },
  excludeFromState: []
})
