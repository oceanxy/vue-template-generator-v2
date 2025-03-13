import qs from 'qs'

export default {
  getAccounts(data) {
    return {
      url: '/example/getList',
      method: 'post',
      data: qs.stringify(data)
    }
  },
  deleteAccounts(data) {
    return {
      url: '/example/delete',
      method: 'post',
      data: qs.stringify(data)
    }
  },
  addAccounts(data) {
    return {
      url: '/example/add',
      method: 'post',
      data
    }
  },
  updateAccounts(data) {
    return {
      url: '/example/add',
      method: 'post',
      data
    }
  },
  updatePasswordOfAccounts(data) {
    return {
      url: '/example/resetPwd',
      method: 'post',
      data
    }
  },
  updateThemeConfig(data) {
    return {
      url: '/example/updateThemeConfig',
      method: 'post',
      data
    }
  }
}
