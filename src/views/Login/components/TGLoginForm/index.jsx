import './index.scss'
import { computed, onMounted, reactive, ref } from 'vue'
import configs from '@/configs'
import { getEnvVar } from '@/utils/env'
import { Button, Form, Input } from 'ant-design-vue'
import useStore from '@/composables/tgStore'

export default {
  name: 'TGLoginForm',
  setup() {
    const isDev = process.env.NODE_ENV === 'development'

    const hint = ref(false)
    const picCodePath = ref('')
    const loginFormState = reactive({
      username: isDev ? process.env.TG_APP_DEV_DEFAULT_ACCOUNT : '',
      password: isDev ? process.env.TG_APP_DEV_DEFAULT_PASSWORD : '',
      picCode: isDev && configs.enableLoginVerification ? 'LANJOR' : ''
    })

    const loginStore = useStore('/login')
    const codeKey = computed(() => loginStore.codeKey)
    const loading = computed(() => loginStore.loading)
    const disabled = computed(() => !loginFormState.username || !loginFormState.password)

    /**
     * 请求新的验证码图片
     * @returns {Promise<void>}
     */
    async function onCodeKeyClick() {
      await loginStore.getCodeKey()
      picCodePath.value = `${getEnvVar('TG_APP_BASE_API')}/auth/verifyCode/loginImg?verifyCodeKey=${codeKey.value}`
    }

    async function onFinish(values) {
      const { status } = await loginStore.login({ payload: values })

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
        <Form.Item name={'username'} rules={[{ required: true, message: '请输入用户名！' }]}>
          <Input vModel:value={loginFormState.username} placeholder="请输入用户名">
            {{ prefix: () => <IconFont type={'icon-login-user'} /> }}
          </Input>
        </Form.Item>
        <Form.Item name={'password'} rules={[{ required: true, message: '请输入密码！' }]}>
          <Input.Password vModel:value={loginFormState.password} placeholder="请输入密码">
            {{ prefix: () => <IconFont type={'icon-login-pwd'} /> }}
          </Input.Password>
        </Form.Item>
        {
          configs.enableLoginVerification
            ? (
              <Form.Item name={'picCode'} rules={[{ required: true, message: '请输入验证码！' }]}>
                <Input value={loginFormState.picCode} placeholder="请输入验证码" loading={true}>
                  {{
                    prefix: () => <IconFont type={'icon-login-captcha'} />,
                    suffix: () => (
                      <img
                        src={picCodePath.value}
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
