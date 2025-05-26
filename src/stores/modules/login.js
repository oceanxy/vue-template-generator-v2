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
      modalForChangePassword: {},
      // 待办事项
      messageList: {
        list: [],
        loading: false
      },
      unreadMessageCount: false,
    },
    actions: {
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
        const callbackUrl = localStorage.getItem(`${appName}-callbackUrl`)

        // 登录成功后，传入callbackUrl时，跳转到指定的页面
        if (callbackUrl) {
          // 动态解析参数对象
          const extractParams = (url) => {
            try {
              const searchParams = new URL(url, window.location.origin).searchParams;
              return Object.fromEntries(searchParams.entries());
            } catch {
              return {};
            }
          };
          const callbackUrlParams = extractParams(callbackUrl);

          await router.replace({ path: callbackUrl, query: callbackUrlParams })
          localStorage.removeItem(`${appName}-callbackUrl`)
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
      async logout() {
        message.loading('正在注销，请稍候...', 0)
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

            console.log('menuList', menuList)

            if (menuList) {
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
      },
      // 获取header上的代办信息暂时先放在login文件
      // 获取代办消息列表
      async getMessageList() {
        this.messageList.loading = true
        const payload = {
          pageSize: 20,
          pageIndex: 0,
          readStatus: '0'
        }

        const res = await apis.getMessageList(payload)

        if (res.status) {
          this.unreadMessageCount = res.data.totalNum ? true : false
        }

        this.messageList.loading = false
      },
      // 用户组织切换
      async switchUserOrg() {
        await apis.switchUserOrg()
      }
    }
  },
  excludeFromState: true,
  isRoot: true
})
