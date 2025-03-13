import qs from 'qs'

export default {
  /**
   * 登录
   * @param data
   * @returns {*}
   */
  login(data) {
    return {
      url: '/example/login',
      mockUrl: '/example/login',
      method: 'post',
      data: qs.stringify(data)
    }
  },
  /**
   * 登出
   * @returns {*}
   */
  logout() {
    return {
      url: '/example/logout',
      method: 'post'
    }
  },
  /**
   * 获取当前登录用户信息
   * @returns {*}
   */
  getUserInfo() {
    return {
      url: '/example/getUserInfo',
      method: 'post'
    }
  }
}
