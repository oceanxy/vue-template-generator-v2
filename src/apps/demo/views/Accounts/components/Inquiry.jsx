import { Form, Input, Select } from 'ant-design-vue'
import useInquiryForm from '@/composables/tgInquiryForm'

export default {
  name: 'AccountInquiry',
  setup() {
    const { TGInquiryForm, formModel } = useInquiryForm()

    return () => (
      <TGInquiryForm fixedColumns>
        <Form.Item label={'状态'}>
          <Select
            vModel:value={formModel.status}
            options={[
              { label: '全部', value: '' },
              { label: '启用', value: 1 },
              { label: '停用', value: 0 }
            ]}
          />
        </Form.Item>
        <Form.Item label={'姓名'}>
          <Input
            vModel:value={formModel.fullName}
            maxLength={4}
            placeholder="请输入姓名"
            allowClear
          />
        </Form.Item>
      </TGInquiryForm>
    )
  }
}
