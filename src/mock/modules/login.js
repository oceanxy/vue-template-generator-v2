export default {
  '/example/login': {
    status: true,
    code: 10000,
    message: '',
    data: {
      token: 'develop token',
      defaultMenuUrl: '/',
      userInfo: {
        id: '7364573105524781366',
        fullName: 'Admin User',
        gender: 1,
        loginName: 'admin user',
        genderStr: '男'
      }
    }
  },
  '/example/logout': {
    status: true,
    code: 10000,
    message: '',
    data: {}
  },
  '/example/getUserInfo': {
    status: true,
    code: 10000,
    message: '',
    data: {
      fullName: 'Admin User',
      loginName: 'admin user'
    }
  }
}
