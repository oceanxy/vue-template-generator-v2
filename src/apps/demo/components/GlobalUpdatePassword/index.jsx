import { Menu } from 'ant-design-vue'
import { dynamicCompMount } from '@/utils/dynamicCompMount'
import useStore from '@/composables/tgStore'
import ModalForChangePassword from '@app/views/Accounts/components/ModalForChangePassword'

export default {
  name: 'GlobalUpdatePassword',
  setup() {
    const commonStore = useStore('./common')

    async function resetPwd() {
      await dynamicCompMount(ModalForChangePassword, { type: 'global' })

      commonStore.setVisibilityOfModal({
        modalStatusFieldName: 'showModalForChangePassword',
        location: 'modalForChangePassword',
        value: true
      })
    }

    return () => <Menu.Item onClick={resetPwd}>修改密码</Menu.Item>
  }
}
