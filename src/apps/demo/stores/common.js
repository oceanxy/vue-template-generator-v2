import { createStore } from '@/stores/createStore'

export default createStore({
  moduleName: 'common',
  module: {
    state: {
      visibilityOfResetPwd: false
    }
  },
  excludeFromState: true
})

