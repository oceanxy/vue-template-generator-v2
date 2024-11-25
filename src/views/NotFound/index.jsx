import TGHeader from '@/components/TGHeader'
import { Button, Layout, Space } from 'ant-design-vue'
import router from '@/router'

const NotFound = () => {
  return (
    <Layout class={'tg-layout tg-not-found'}>
      <TGHeader />
      <Layout class={'tg-not-found-content'}>
        <Space class={'hint'}>
          <span>页面走丢了~</span>
          <Button type={'link'} onClick={() => router.replace('/')}>返回首页</Button>
        </Space>
      </Layout>
    </Layout>
  )
}

export default NotFound
