import { Button, Layout } from 'ant-design-vue'
import TGHeader from '@/components/TGHeader'
import router from '@/router'
import useStore from '@/composables/tgStore'

export default {
  name: 'NoAccess',
  setup() {
    const loginStore = useStore('/login')

    return () => (
      <Layout class={'tg-layout tg-no-access'}>
        <TGHeader />
        <Layout class={'tg-not-found-content'}>
          <div class={'hint'}>
            <span>无访问权限~</span>
            {
              +router.currentRoute.value.query['no-link'] !== 1 &&
              <span>
                <Button
                  type={'link'}
                  onClick={() => router.replace('/')}
                >
                  返回首页
                </Button>
                或
              </span>
            }
            <Button
              type={'link'}
              onClick={() => {
                loginStore.clear()
                router.replace({ name: 'Login' })
              }}
            >
              重新登录
            </Button>
          </div>
        </Layout>
      </Layout>
    )
  }
}
