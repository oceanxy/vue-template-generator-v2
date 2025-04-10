import { defineComponent, nextTick, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getCookie } from '@/utils/cookie'
import { getFirstLetterOfEachWordOfAppName } from '@/utils/utilityFunction'
import configs from '@/configs'
import useStore from '@/composables/tgStore'

const appName = getFirstLetterOfEachWordOfAppName()

export default defineComponent({
  name: 'TGLoginWithToken',
  setup(props, { emit }) {
    const loginStore = useStore('/login')

    onMounted(async () => {
      const searchToken = new URL(window.location.href).searchParams.get(configs.tokenConfig.fieldName)
      const localToken = localStorage.getItem(`${appName}-${configs.tokenConfig.fieldName}`)
      // 使用局部变量代替直接操作 props.token
      let tokenFromProps = props.token || null

      const token = searchToken ||
        tokenFromProps ||
        getCookie(configs.tokenConfig.fieldName) ||
        localToken

      // 如果 search 中存在 token，则删除之
      if (searchToken) {
        window.history.replaceState(null, null, window.location.pathname)
      }

      // 如果 hash 中存在 token，将其置为 null 而非直接删除
      if (tokenFromProps) {
        tokenFromProps = null
      }

      if (token) {
        message.destroy()
        localStorage.setItem(`${appName}-${configs.tokenConfig.fieldName}`, token)

        const response = await loginStore.getUserInfo({ token })

        if (response.status) {
          emit('errorStateChange', { status: false, error: null })
          await loginStore.jumpAfterLogin()
        } else {
          message.error(response.message || '获取用户信息失败', 0)

          await loginStore.clear()
          // 接口调用失败请了token
          localStorage.removeItem(`${appName}-${configs.tokenConfig.fieldName}`)
          emit('errorStateChange', { status: true, error: new Error(response.message || '获取用户信息失败') })

          nextTick(() => {
            jumpToThirdPartyLogin()
          })
        }
      } else {
        message.error('未检测到登录令牌或登录令牌已失效', 0)

        await loginStore.clear()
        emit('errorStateChange', { status: true, error: new Error('请检查登录令牌是否有效') })

        jumpToThirdPartyLogin()
      }
    })

    const jumpToThirdPartyLogin = () => {
      if (process.env.VUE_APP_LOGIN_ADDRESS) {
        let url

        try {
          const URL = new window.URL(process.env.VUE_APP_LOGIN_ADDRESS)

          url = URL.href
        } catch (e) {
          url = window.location.origin + process.env.VUE_APP_LOGIN_ADDRESS
        } finally {
          window.location.href = url
        }
      }
    }

    return () => null
  }
})
