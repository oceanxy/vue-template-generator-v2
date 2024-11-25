import './styles/index.scss'
import config from '@/configs'
import { computed } from 'vue'
import { useCommonStore } from '@/stores/modules/common'
import { useRouter } from '@/router'

const TGLogo = () => {
  const { push } = useRouter()
  const showMenu = computed(() => useCommonStore().showMenu)

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
