/**
 * 需要账号密码的登录组件
 */

import configs from '@/configs'
import TGCard from '@/components/TGCard'
import TGLoginForm from './components/TGLoginForm'
import './assets/styles/index.scss'

export default {
  name: 'Login',
  setup() {
    return () => (
      <div class={'tg-login'}>
        <div class={'tg-login-title'} />
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
        <div class={'corporate-services'}>技术支持</div>
      </div>
    )
  }
}
