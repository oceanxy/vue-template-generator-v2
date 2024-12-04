import './styles/index.scss'
import config from '@/configs'
import { computed } from 'vue'
import { useRouter } from '@/router'
import useStore from '@/composables/tgStore'

const TGLogo = () => {
  const commonStore = useStore('/common')
  const { push } = useRouter()
  const showMenu = computed(() => commonStore.showMenu)

  /**
   * 返回首页
   * @returns {Promise<void>}
   */
  async function goBackHome() {
    if (showMenu.value) {
      await push({ name: 'Home' })
    }
  }

  return (
    <div
      class={'tg-logo'}
      onClick={goBackHome}
      title={config.systemName}
    >
      <IconFont type={'icon-logo'} />
      {config.systemName}
    </div>
  )
}

export default TGLogo
