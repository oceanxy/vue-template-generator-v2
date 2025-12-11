import { createStore } from '@/stores/createStore'
import dayjs from 'dayjs'
import configs from '@/configs'
import { message } from 'ant-design-vue'
import router from '@/router'
import { firstLetterToUppercase, getFirstLetterOfEachWordOfAppName } from '@/utils/utilityFunction'
import apis from '@/apis'
import useStore from '@/composables/tgStore'

const appName = getFirstLetterOfEachWordOfAppName()

export default createStore({
  moduleName: 'login',
  module: {
    persist: {
      enabled: true,
      key: `${appName}-login-state`,
      storage: localStorage,
      pick: ['currentItem', 'details']
    },
    state: {
      // 如果要在APP入口中验证TOKEN有效性，请配合`src/composables/tgAuthentication`使用
      isTokenValid: false,
      // 'pending' 'success' 'failed'。注意，默认值idle代表从未修改过的空闲状态，请勿将该变量重置为“idle”，以免引起程序出现预料之外的状态错误。
      verifyStatus: 'idle',
      // 上一次Token有效性验证时间
      lastVerifyTime: null,
      // 登录页面加载数据的状态
      loading: false,
      loadingMessage: {
        title: '',
        content: ''
      },
      // 验证码
      captcha: '',
      // 用于保存当前页面内弹窗可能用到的临时数据
      currentItem: {},
      // 登录接口返回的原始数据统一存储在此处，各子系统按需存取
      details: {
        menuList: [],
        userInfo: {},
        defaultMenuUrl: ''
      }
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

        // 登录操作全部完成后，跳转进入系统前，清空状态信息
        this.$patch({
          verifyStatus: 'idle',
          loadingMessage: {
            title: '',
            content: ''
          }
        })

        // 只有处于登录页面时，才执行路由重定向
        if (router.currentRoute.value.name === 'Login') {
          // 检测query参数是否存在重定向
          const { redirect, ...query } = router.currentRoute.value.query
          // 检测本地存储是否存在保存的路由（意外退出的路由），如果有，则在登录成功后直接跳转到该路由
          const selectedRoute = localStorage.getItem(`${appName}-selectedKey`)

          if (redirect) {
            await router.replace({ path: `${redirect}`, query })
          } else if (selectedRoute) {
            await router.replace(selectedRoute)
          } else {
            await router.replace({ name: 'Home' })
          }
        }
      },
      async login(payload, api) {
        this.loading = true

        const response = await apis[api || 'login'](payload)
        const { status } = response

        if (status) {
          this.$patch({
            isTokenValid: true,
            verifyStatus: 'success',
            details: response.data
          })

          const appName = getFirstLetterOfEachWordOfAppName()

          // 缓存系统必需的参数
          localStorage.setItem(`${appName}-${configs.tokenConfig.fieldName}`, response.data.token)
          localStorage.setItem(`${appName}-defaultRoute`, firstLetterToUppercase(response.data.defaultMenuUrl || ''))
          localStorage.setItem(`${appName}-menu`, JSON.stringify(response.data.menuList || []))

          if (configs.buttonPermissions) {
            localStorage.setItem(`${appName}-buttonPermissions`, JSON.stringify(response.data.buttonPermissions || []))
          }

          const commonStore = useStore('/common')

          commonStore.setTheme(appName, response.data.userInfo)
        }

        this.$patch({ loading: false })

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
        return await this.login(payload, 'getUserInfo')
      },
      /**
       * 清除 store 和本地存储的信息
       * @returns {Promise<boolean>}
       */
      async clear() {
        router.removeRoute('Home')

        const appName = getFirstLetterOfEachWordOfAppName()

        this.details = {}
        this.isTokenValid = false
        this.verifyStatus = 'failed'

        localStorage.removeItem(`${appName}-${configs.tokenConfig.fieldName}`)
        localStorage.removeItem(`${appName}-defaultRoute`)
        localStorage.removeItem(`${appName}-menu`)
        localStorage.removeItem(`${appName}-selectedKey`)
        localStorage.setItem(`${appName}-theme`, configs.header.buttons.theme.default)

        if (configs.buttonPermissions) {
          localStorage.removeItem(`${appName}-buttonPermissions`)
        }

        const commonStore = useStore('/common')

        if (configs.enableTabPage) {
          localStorage.removeItem(`${appName}-openKeys`)
          commonStore.pageTabs = []
        }

        commonStore.themeName = configs.header.buttons.theme.default

        return Promise.resolve(true)
      },
      async getCaptcha() {
        const response = await apis.getCaptcha()

        if (response.status) {
          this.captcha = response.data
        } else {
          this.captcha = ''
        }
      }
    }
  },
  excludeFromState: true,
  isRoot: true
})
