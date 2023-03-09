import forTable from '@/mixins/forTable'
import forFunction from '@/mixins/forFunction'
import { Button, Space } from 'ant-design-vue'

export default {
  mixins: [forTable(), forFunction()],
  data() {
    return {
      tableProps: {
        columns: [
          {
            title: '序号',
            width: 60,
            align: 'center',
            fixed: true,
            scopedSlots: { customRender: 'serialNumber' }
          },
          {
            title: '开发商',
            width: 120,
            dataIndex: 'developerName'
          },
          {
            title: '项目',
            width: 80,
            dataIndex: 'projectName'
          },
          {
            title: '不动产名称',
            width: 140,
            dataIndex: 'easteName'
          },
          {
            title: '性质',
            width: 70,
            align: 'center',
            dataIndex: 'easteDicName'
          },
          {
            title: '建面㎡',
            width: 70,
            align: 'center',
            dataIndex: 'buildArea'
          },
          {
            title: '套内㎡',
            width: 70,
            align: 'center',
            dataIndex: 'infloorArea'
          },
          {
            title: '备案总价(万元)',
            width: 120,
            dataIndex: 'recordTotal'
          },
          {
            title: '备案单价(万元)',
            width: 120,
            dataIndex: 'recordSingle'
          },
          {
            title: '评估价值(万元)',
            width: 120,
            dataIndex: 'assessMoney'
          },
          {
            title: '是否完工',
            width: 80,
            align: 'center',
            dataIndex: 'isEndStr'
          },
          {
            title: '收购金额(万元)',
            width: 120,
            dataIndex: 'acquisitionMoney'
          },
          {
            title: '操作',
            fixed: 'right',
            align: 'center',
            width: 150,
            scopedSlots: { customRender: 'operation' }
          }
        ]
      },
      scopedSlots: {
        title: (text, record) => (
          <Space>
            <Button onClick={() => this.onExport()}>导出</Button>
            <Button disabled={this.tableSelectedRowKeys} onClick={() => this.onDeleteClick()}>删除</Button>
          </Space>
        ),
        operation: (text, record) => (
          <Space>
            {
              record.acquisitionMoney ? '' : <Button
                type="link"
                size="small"
                disabled={this.isFeatureDisabled}
                onClick={() => this.onEditClick(record)}
              >
                编辑
              </Button>
            }

            <Button
              type="link"
              size="small"
              disabled={this.isFeatureDisabled}
              onClick={() => this.onDeleteClick(record)}
            >
              删除
            </Button>
            {
              record.acquisitionMoney ? '' : <Button
                type="link"
                size="small"
                disabled={this.isFeatureDisabled}
                onClick={() => this._setVisibilityOfModal(record, 'modalOfPurchaseVisible')}
              >
                收购
              </Button>
            }

          </Space>
        )
      }
    }
  },
  computed: {
    // 学校及学校下级禁用新增、修改或删除等一切操作
    isFeatureDisabled() {
      const { type } = this.$store.state[this.moduleName].search

      // 类型（1.区 2.职能部门 3.街道 4.学校顶级 5.学校 6.年级 7.班级）
      return [4, 5, 6, 7].includes(type)
    },
    tableSelectedRowKeys() {
      if (this.getState('selectedRowKeys', this.moduleName).length > 0) {
        return false
      } else {
        return true
      }
    },
  }
}
