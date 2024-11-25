import TGHeader from '@/components/TGHeader'
import { Button, Layout, Space } from 'ant-design-vue'
import router from '@/router'

const NoAccess = () => {
  return (
    <Layout class={'tg-layout tg-no-access'}>
      <TGHeader />
      <Layout class={'tg-not-found-content'}>
        <Space class={'hint'}>
          <span>无访问权限~</span>
          {
            +router.currentRoute.value.query['no-link'] !== 1 &&
            (
              <Button
                type={'link'}
                onClick={() => this.$router.replace('/')}
              >
                返回首页
              </Button>
            )
          }
        </Space>
      </Layout>
    </Layout>
  )
}
export default NoAccess
