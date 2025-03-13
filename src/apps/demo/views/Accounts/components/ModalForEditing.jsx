import { Form, Input, InputNumber, InputPassword, Select, Switch } from 'ant-design-vue'
import useTGFormModal from '@/composables/tgFormModal'

export default {
  name: 'ModalForEditingAccounts',
  setup() {
    const location = 'modalForEditing'
    const modalProps = {
      width: 810,
      title: '{ACTION}账户',
      onOk: () => handleFinish()
    }
    const rules = {
      fullName: [
        {
          required: true,
          message: '请输入职员姓名'
        }
      ],
      gender: [
        {
          required: true,
          type: 'number',
          message: '请选择性别'
        }
      ],
      loginName: [
        {
          required: true,
          message: '请输入职员登录名'
        }
      ],
      loginPwd: [
        {
          required: true,
          message: '请输入职员登录密码'
        }
      ],
      sortIndex: [
        {
          required: true,
          message: '请输入排序值'
        }
      ]
    }

    const {
      formModel,
      validateInfos,
      handleFinish,
      TGFormModal,
      currentItem
    } = useTGFormModal({
      modalProps,
      rules,
      location
    })

    return () => (
      <TGFormModal>
        <Form.Item label="姓名" class={'half'} {...validateInfos.fullName}>
          <Input
            vModel:value={formModel.fullName}
            maxLength={10}
            placeholder="请输入职员姓名"
            allowClear
          />
        </Form.Item>
        <Form.Item label="性别" class={'half'} {...validateInfos.gender}>
          <Select vModel:value={formModel.gender} placeholder="请选择性别">
            <Select.Option value={0}>未知</Select.Option>
            <Select.Option value={1}>男</Select.Option>
            <Select.Option value={2}>女</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="登录名" class={'half'} {...validateInfos.loginName}>
          <Input
            vModel:value={formModel.loginName}
            maxLength={32}
            disabled={!!currentItem.value.id}
            autocomplete="off"
            placeholder="请输入职员登录名"
            allowClear
          />
        </Form.Item>
        {
          !currentItem.value.id && (
            <Form.Item label="密码" class={'half'} {...validateInfos.loginPwd}>
              <InputPassword
                vModel:value={formModel.loginPwd}
                maxLength={32}
                placeholder="请输入职员登录密码"
                allowClear
              />
            </Form.Item>
          )
        }
        <Form.Item label="联系电话" class={'half'}>
          <Input
            vModel:value={formModel.tel}
            maxLength={32}
            placeholder="请输入联系电话"
            allowClear
          />
        </Form.Item>
        <Form.Item label="邮箱" class={'half'}>
          <Input
            vModel:value={formModel.email}
            maxLength={52}
            placeholder="请输入邮箱"
            allowClear
          />
        </Form.Item>
        <Form.Item label="QQ" class={'half'}>
          <Input
            vModel:value={formModel.qq}
            maxLength={32}
            placeholder="请输入QQ号码"
            allowClear
          />
        </Form.Item>
        <Form.Item label="排序" class={'half'} {...validateInfos.sortIndex}>
          <InputNumber
            vModel:value={formModel.sortIndex}
            min={0}
            max={99999999}
            step={1}
            precision={0}
            placeholder="数值越大排在越前"
            allowClear
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="状态" class={'half'}>
          <Switch
            vModel:checked={formModel.status}
            checkedValue={1}
            unCheckedValue={0}
          />
        </Form.Item>
      </TGFormModal>
    )
  }
}
