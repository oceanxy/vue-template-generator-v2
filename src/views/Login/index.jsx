/**
 * 需要账号密码的登录组件
 */

import './assets/styles/index.scss'
import TGLoginForm from './components/TGLoginForm'
import TGCard from '@/components/TGCard'
import configs from '@/configs'

export default {
  name: 'Login',
  props: {
    isShowSiteName: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({ activeKey: 1 }),
  methods: {
    handleTabClick(key) {
      this.activeKey = key
    }
  },
  render() {
    return (
      <div class={'tg-login'}>
        <div class={'title'} />
        <TGCard
          width={400}
          class={'tg-login-box'}
          contentClass={'login-box-content'}
          showTitleShape={false}
        >
          <div class={'login-subtitle'}>
            <p>您好!</p>
            <p>欢迎登录{configs.systemName}</p>
          </div>
          <TGLoginForm />
        </TGCard>
        {/* <div class={'corporate-services'}>重庆蓝桥科技有限公司技术支持</div> */}
      </div>
    )
  }
}
