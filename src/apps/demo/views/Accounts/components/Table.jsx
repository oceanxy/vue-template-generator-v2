import { Button } from 'ant-design-vue'
import useTGTable from '@/composables/tgTable'

export default {
  name: 'AccountTable',
  setup() {
    const tableProps = {
      columns: [
        {
          fixed: true,
          title: '姓名',
          width: 100,
          align: 'center',
          dataIndex: 'fullName'
        },
        {
          title: '性别',
          width: 80,
          align: 'center',
          dataIndex: 'gender'
        },
        {
          title: '登录名',
          width: 120,
          dataIndex: 'loginName'
        },
        {
          title: '电话号码',
          width: 120,
          dataIndex: 'tel'
        },
        {
          title: 'QQ',
          width: 100,
          dataIndex: 'qq'
        },
        {
          title: '邮箱',
          width: 160,
          dataIndex: 'email'
        },
        {
          title: '创建时间',
          width: 140,
          dataIndex: 'createTime'
        },
        {
          title: '备注',
          width: 200,
          dataIndex: 'remark'
        },
        {
          title: '描述',
          width: 400,
          dataIndex: 'description'
        },
        {
          title: '状态',
          align: 'center',
          width: 80,
          fixed: 'right',
          dataIndex: 'status'
        },
        {
          title: '操作',
          key: 'operation',
          fixed: 'right',
          align: 'center',
          width: 180,
          customRender: ({ record }) => [
            <Button
              type="link"
              size="small"
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>,
            <Button
              type="link"
              size="small"
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>,
            <Button
              type="link"
              size="small"
              onClick={() => handleClick(record, 'showModalForChangePassword', { location: 'modalForChangePassword' })}
            >
              修改密码
            </Button>
          ]
        }
      ]
    }

    const {
      handleDelete,
      handleEdit,
      handleClick,
      TGTable
    } = useTGTable({ props: tableProps })

    return () => <TGTable />
  }
}
