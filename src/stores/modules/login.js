import { createStore } from '@/stores/createStore'
import JSEncrypt from 'jsencrypt'
import dayjs from 'dayjs'
import configs from '@/configs'
import { message } from 'ant-design-vue'
import router from '@/router'
import { firstLetterToUppercase, getFirstLetterOfEachWordOfAppName } from '@/utils/utilityFunction'
import apis from '@/apis'
import useStore from '@/composables/tgStore'
// import { fetchProdEnvTheme, loadDevEnvTheme } from '@/assets/styles'

export default createStore({
  moduleName: 'login',
  module: {
    state: {
      // 如果要在APP入口中验证TOKEN有效性，请配合`src/composables/tgAuthentication`使用
      isTokenValid: false,
      verifyStatus: 'idle', // 'pending'/'success'/'failed'
      lastVerifyTime: null,
      // 加载用户信息的状态
      loading: false,
      // 最后一次登录时间，用来判断用户信息的新旧程度，实现前端主动在一个合适的时间重新验证 token 有效性
      lastLoginTime: null,
      // 最后一次登录 token，用来比较是否刷新用户信息
      lastLoginToken: '',
      // 用户信息
      userInfo: {},
      // 验证码
      codeKey: '',
      // 用于保存当前页面内弹窗可能用到的临时数据
      currentItem: {},
      // 全局修改密码弹窗的显示状态
      showModalForChangePassword: false,
      modalForChangePassword: {}
    },
    actions: {
      async verifyToken(params) {
        this.verifyStatus = 'pending'

        try {
          const res = await apis.authentication?.(params) ?? { status: true, data: true }

          if (res.status) {
            this.verifyStatus = 'success'
            this.isTokenValid = true
          } else {
            this.verifyStatus = 'failed'
            this.isTokenValid = false
          }

          this.lastVerifyTime = dayjs().format()

          return res
        } catch (e) {
          this.verifyStatus = 'failed'
          this.isTokenValid = false
          throw e
        }
      },
      async jumpAfterLogin() {
        const appName = getFirstLetterOfEachWordOfAppName()

        // 重置路由
        await router.resetRouter()

        // 重置主题
        // if (process.env.NODE_ENV === 'production') {
        //   fetchProdEnvTheme()
        // } else {
        //   loadDevEnvTheme()
        // }

        // 检测query参数是否存在重定向
        const { redirect, ...query } = router.currentRoute.value.query
        // 检测本地存储是否存在保存的路由（意外退出的路由），如果有，则在登录成功后直接跳转到该路由
        const selectedRoute = localStorage.getItem(`${appName}-selectedKey`)
        // 检测本地缓存是否存在指定回调地址，如果有则在登录之后直接跳转指定路由然后删除缓存
        let callbackUrl = null
        if (localStorage.getItem(`${appName}-callbackUrl`)) {
          callbackUrl = JSON.parse(localStorage.getItem(`${appName}-callbackUrl`))
        }

        // 登录成功后，传入callbackUrl时，跳转到指定的页面
        if (callbackUrl) {
          // 处理在跳转的时候用path获取name 用于跳转页面
          //查询路由name
          const routerItem = router.resolve(callbackUrl.path)
          localStorage.removeItem(`${appName}-callbackUrl`)

          await router.replace({ name: routerItem.name, query: callbackUrl.query })

        } else {
          if (redirect) {
            await router.replace({ path: `${redirect}`, query })
          } else if (selectedRoute) {
            await router.replace(selectedRoute)
          } else {
            await router.replace({ name: 'Home' })
          }
        }
      },
      async login(options) {
        this.loading = true

        const { payload } = options
        const encryptor = new JSEncrypt()

        encryptor.setPublicKey(configs.publicKey)

        const response = await apis.login({
          up: encryptor.encrypt(
            JSON.stringify({
              u: payload.username,
              p: payload.password
            })
          ),
          vck: payload.picCode,
          verifyCodeKey: this.codeKey
        })

        const { status } = response

        if (status) {
          const {
            userInfo,
            token,
            menuList,
            defaultMenuUrl
          } = response.data

          this.isTokenValid = true
          this.userInfo = userInfo
          this.lastLoginTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
          this.lastLoginToken = token

          const appName = getFirstLetterOfEachWordOfAppName()

          localStorage.setItem(`${appName}-${configs.tokenConfig.fieldName}`, token)
          localStorage.setItem(`${appName}-defaultRoute`, firstLetterToUppercase(defaultMenuUrl) || '')
          localStorage.setItem(`${appName}-menu`, JSON.stringify(menuList))
          localStorage.setItem(`${appName}-buttonPermissions`, JSON.stringify(null))
          localStorage.setItem(`${appName}-lastLoginTime`, this.lastLoginTime)

          this.setParamsUseInHeader()

          const commonStore = useStore('/common')

          commonStore.setTheme(appName, userInfo)
        }

        this.loading = false

        return Promise.resolve(response)
      },
      // 从第三方获取到 token 后，进行登录操作
      async trilateralLogin(payload) {
        this.loading = true

        const response = await apis.trilateralLogin(payload)

        const { status } = response

        if (status) {
          const { userInfo, token } = response.data

          this.isTokenValid = true
          this.userInfo = userInfo
          this.lastLoginTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
          this.lastLoginToken = token

          const appName = getFirstLetterOfEachWordOfAppName()

          if (__TG_APP_USER_INFO_MAPPINGS__) {
            // 适配非蓝桥后端框架的用户信息返回体
            const userInfoResponseData = __TG_APP_USER_INFO_MAPPINGS__.mapping(response.data)

            const menuList = userInfoResponseData.menuList
            const defaultMenuUrl = userInfoResponseData.defaultMenuUrl
            const buttonPermissions = userInfoResponseData.buttonPermissions

            if (menuList.length) {
              localStorage.setItem(`${appName}-defaultRoute`, defaultMenuUrl || '')
              localStorage.setItem(`${appName}-menu`, JSON.stringify(menuList))
              localStorage.setItem(`${appName}-buttonPermissions`, JSON.stringify(buttonPermissions))
            }
          }

          localStorage.setItem(`${appName}-${configs.tokenConfig.fieldName}`, token)
          localStorage.setItem(`${appName}-lastLoginTime`, this.lastLoginTime)

          this.setParamsUseInHeader()

          const commonStore = useStore('/common')

          commonStore.setTheme(appName, userInfo)
        }

        this.loading = false

        return Promise.resolve(response)
      },
      async logout() {
        message.loading('正在退出登录，请稍候...', 0)
        this.loading = true

        const response = await apis.logout()

        // if (response.status) {
        await this.clear()
        message.destroy()

        await router.replace({
          name: 'Login',
          // 提供给子项目的登录页面处理注销后的逻辑
          params: { logout: '1' }
        })
        // }

        this.loading = false

        return Promise.resolve(response)
      },
      async getUserInfo(payload) {
        this.loading = true

        const response = await apis.getUserInfo(payload)

        const status = response.status

        if (status) {
          let userInfo
          const appName = getFirstLetterOfEachWordOfAppName()

          if (__TG_APP_USER_INFO_MAPPINGS__) {
            // 适配非蓝桥后端框架的用户信息返回体
            const userInfoResponseData = __TG_APP_USER_INFO_MAPPINGS__.mapping(response.data)

            userInfo = userInfoResponseData.userInfo
            const menuList = userInfoResponseData.menuList
            const defaultMenuUrl = userInfoResponseData.defaultMenuUrl
            const buttonPermissions = userInfoResponseData.buttonPermissions

            if (menuList.length) {
              localStorage.setItem(`${appName}-defaultRoute`, defaultMenuUrl || '')
              localStorage.setItem(`${appName}-menu`, JSON.stringify(menuList))
              localStorage.setItem(`${appName}-buttonPermissions`, JSON.stringify(buttonPermissions))
            }
          } else {
            userInfo = response.data
          }

          localStorage.setItem(`${appName}-${configs.tokenConfig.fieldName}`, payload.token)

          this.userInfo = userInfo

          this.lastLoginTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
          this.lastLoginToken = payload.token
          this.setParamsUseInHeader()
          localStorage.setItem(`${appName}-lastLoginTime`, this.lastLoginTime)

          const commonStore = useStore('/common')

          commonStore.setTheme(appName, userInfo)

          // 判断config配置文件中是否配置顶部消息 news属性配置
          // 在完成获取用户信息之后，获取代办信息
        }

        this.loading = false

        return Promise.resolve(response)
      },
      /**
       * 设置Header内需要使用的参数
       */
      setParamsUseInHeader() {
        if (configs.header?.params?.show) {
          const appName = getFirstLetterOfEachWordOfAppName()
          const organId = localStorage.getItem(`${appName}-headerId`) || this.userInfo.organId || ''

          localStorage.setItem(`${appName}-headerId`, organId)
          const commonStore = useStore('/common')

          commonStore.headerId = organId
          commonStore.organListForHeader.list = this.userInfo.organList
        }
      },
      /**
       * 清除 store 和本地存储的信息
       * @returns {Promise<boolean>}
       */
      async clear() {
        router.removeRoute('Home')

        const appName = getFirstLetterOfEachWordOfAppName()

        this.userInfo = {}
        this.lastLoginTime = null
        this.lastLoginToken = null
        this.isTokenValid = false
        localStorage.removeItem(`${appName}-${configs.tokenConfig.fieldName}`)

        localStorage.removeItem(`${appName}-defaultRoute`)
        localStorage.removeItem(`${appName}-menu`)
        localStorage.removeItem(`${appName}-buttonPermissions`)
        localStorage.removeItem(`${appName}-lastLoginTime`)

        localStorage.setItem(`${appName}-theme`, configs.header.buttons.theme.default)
        localStorage.removeItem(`${appName}-openKeys`)
        localStorage.removeItem(`${appName}-selectedKey`)

        const commonStore = useStore('/common')

        if (configs.enableTabPage) {
          commonStore.pageTabs = []
        }

        commonStore.themeName = configs.header.buttons.theme.default

        if (configs.header?.params?.show) {
          localStorage.removeItem(`${appName}-headerId`)
          commonStore.headerId = null
          commonStore.organListForHeader.list = []
        }

        return Promise.resolve(true)
      },
      async getCodeKey() {
        const response = await apis.getCodeKey()

        if (response.status) {
          this.codeKey = response.data
        } else {
          this.codeKey = ''
        }
      }
    }
  },
  excludeFromState: true,
  isRoot: true
})
