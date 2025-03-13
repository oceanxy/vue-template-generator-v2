import '../assets/styles/index.scss'
import { Form, InputPassword } from 'ant-design-vue'
import useTGFormModal from '@/composables/tgFormModal'
import { message } from 'ant-design-vue/es/components'
import { computed } from 'vue'
import useStore from '@/composables/tgStore'
import { set } from 'lodash/object'

export default {
  name: 'ModalForChangePassword',
  props: {
    // 'global' / 'local'
    type: { type: String, default: 'local' },
    okText: { type: String, default: '确定' },
    cancelText: { type: String, default: '关闭' }
  },
  setup(props, { attrs }) {
    const loginStore = useStore('/login')
    const userInfo = computed(() => loginStore.userInfo)
    const location = 'modalForChangePassword'
    const modalStatusFieldName = 'showModalForChangePassword'
    const modalProps = {
      okText: props.okText,
      cancelText: props.cancelText,
      width: 400,
      title: props.type === 'global' ? '重置账户密码' : '重置密码',
      onOk: async () => {
        await handleFinish({
          apiName: 'updatePasswordOfAccounts',
          isRefreshTable: false,
          params: () => {
            if (props.type !== 'global') {
              return { ids: currentItem.value.id }
            } else {
              return { ids: userInfo.value.id }
            }
          },
          success: async (res, currentItemCache) => {
            if (props.type !== 'local' || userInfo.value.id === currentItemCache.id) {
              await loginStore.logout()

              message.success('密码修改成功，请重新登录！')
            } else {
              message.success('密码修改成功')
            }
          }
        })
      }
    }
    const rules = {
      pwd: [
        {
          required: true,
          message: '请输入新的职员登录密码！'
        }
      ]
    }

    // 为 login store 内的修改密码表单初始化字段。因为该弹窗可能被全局调用，所以不能在框架级的store内定义项目级的字段。
    set(loginStore, `${location}.form.pwd`, undefined)

    const {
      TGFormModal,
      handleFinish,
      formModel,
      validateInfos,
      currentItem
    } = useTGFormModal({
      storeName: props.type === 'global' ? '/login' : undefined,
      modalProps,
      modalStatusFieldName,
      rules,
      location
    })

    return () => (
      <TGFormModal>
        <Form.Item label="新密码" {...validateInfos.pwd}>
          <InputPassword
            vModel:value={formModel.pwd}
            maxLength={32}
            placeholder="请输入新的职员登录密码"
            allowClear
          />
        </Form.Item>
      </TGFormModal>
    )
  }
}
