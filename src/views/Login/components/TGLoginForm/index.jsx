import { computed, onMounted, reactive, ref } from 'vue'
import configs from '@/configs'
import { getEnvVar } from '@/utils/env'
import { Button, Form, Input } from 'ant-design-vue'
import useStore from '@/composables/tgStore'
import './index.scss'

export default {
  name: 'TGLoginForm',
  props: { formattingParameters: Function },
  setup(props) {
    const isDev = process.env.NODE_ENV === 'development'

    const hint = ref(false)
    const captchaPath = ref('')
    const loginFormState = reactive({
      username: isDev ? process.env.TG_APP_DEV_DEFAULT_ACCOUNT : '',
      password: isDev ? process.env.TG_APP_DEV_DEFAULT_PASSWORD : '',
      captcha: isDev && configs.enableLoginVerification ? 'LANJOR' : ''
    })

    const loginStore = useStore('/login')
    const captcha = computed(() => loginStore.captcha)
    const loading = computed(() => loginStore.loading)
    const disabled = computed(() => !loginFormState.username || !loginFormState.password)

    /**
     * 请求新的验证码图片
     * @returns {Promise<void>}
     */
    async function onCodeKeyClick() {
      await loginStore.getCaptcha()
      captchaPath.value = `${getEnvVar('TG_APP_BASE_API')}/auth/verifyCode/loginImg?verifyCodeKey=${captcha.value}`
    }

    async function onFinish(payload) {
      if (typeof props.formattingParameters === 'function') {
        payload = props.formattingParameters(payload)
      }

      const { status } = await loginStore.login(payload)

      if (!status) {
        if (configs.enableLoginVerification) {
          await onCodeKeyClick()
        }
      } else {
        hint.value = true
        await loginStore.jumpAfterLogin()
        hint.value = false
      }
    }

    onMounted(async () => {
      loginStore.loading = false

      if (configs.enableLoginVerification) {
        await onCodeKeyClick()
      }
    })

    return () => (
      <Form
        model={loginFormState}
        class="tg-login-form"
        name={'login_form'}
        onFinish={onFinish}
      >
        <Form.Item
          name={'username'}
          rules={[{ required: true, message: '请输入用户名！' }]}
        >
          <Input
            vModel:value={loginFormState.username}
            placeholder="请输入用户名"
          >
            {{ prefix: () => <IconFont type={'icon-login-user'} /> }}
          </Input>
        </Form.Item>
        <Form.Item
          name={'password'}
          rules={[{ required: true, message: '请输入密码！' }]}
        >
          <Input.Password
            vModel:value={loginFormState.password}
            placeholder="请输入密码"
          >
            {{ prefix: () => <IconFont type={'icon-login-pwd'} /> }}
          </Input.Password>
        </Form.Item>
        {
          configs.enableLoginVerification
            ? (
              <Form.Item
                name={'captcha'}
                rules={[{ required: true, message: '请输入验证码！' }]}
              >
                <Input
                  vModel:value={loginFormState.captcha}
                  placeholder="请输入验证码"
                  loading={true}
                >
                  {{
                    prefix: () => <IconFont type={'icon-login-captcha'} />,
                    suffix: () => (
                      <img
                        src={captchaPath.value}
                        alt="captcha"
                        onClick={onCodeKeyClick}
                      />
                    )
                  }}
                </Input>
              </Form.Item>
            )
            : null
        }
        <Form.Item>
          <Button
            type={'primary'}
            htmlType={'submit'}
            loading={loading.value || hint.value}
            icon={(loading.value || hint.value) ? 'loading' : ''}
            disabled={loading.value || hint.value}
            class={'tg-login-submit'}
          >
            {
              hint.value
                ? '正在进入系统，请稍候...'
                : loading.value ? '正在登录' : '立即登录'
            }
          </Button>
        </Form.Item>
      </Form>
    )
  }
}
