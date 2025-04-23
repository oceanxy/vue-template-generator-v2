/**
 * 全局通用mock接口
 *
 * URL 对应 src/apis 内同名的`url`或`mockUrl`，
 * 当 src/apis 内存在相同的 URL 时，会自动拦截该接口。
 */

/* eslint-disable max-len */
export default {
  '/example/getMap': {
    status: true,
    code: 10000,
    message: '',
    'data|33': [
      {
        // 数据集合	array	走访任务排行榜
        'dataList|5': [
          {
            count: '@integer(100,1000)', // 数量	string
            id: '@uuid', // id	string
            'name|+1': ['户数', '人口数', '网格员', '户情指标', '采集指标'] // 数据条目名称	string
          }
        ],
        'id|+1': [
          '500853', '500837', '500838', '500839', '500842', '500840', '500863', '500844', '500862', '500858', '500846',
          '500841', '500860', '500865', '500857', '500855', '500850', '500859', '500861', '500848', '500854', '500851',
          '500849', '500856', '500847', '500836', '500852', '500866', '500864', '500845', '500843'
        ], // string
        'name|+1': [
          '安坪镇',
          '夔门街道',
          '白帝镇',
          '草堂镇',
          '大树镇',
          '汾河镇',
          '冯坪乡',
          '公平镇',
          '鹤峰乡',
          '红土乡',
          '甲高镇',
          '康乐镇',
          '康坪乡',
          '龙桥土家族乡',
          '平安乡',
          '青莲镇',
          '青龙镇',
          '石岗乡',
          '太和土家族乡',
          '吐祥镇',
          '五马镇',
          '新民镇',
          '兴隆镇',
          '岩湾乡',
          '羊市镇',
          '鱼复街道',
          '永乐镇',
          '云雾土家族乡',
          '长安土家族乡',
          '朱衣镇',
          '竹园镇'
        ] // 名称  string
      }
    ]
  },
  '/example/getList': {
    status: true,
    code: 10000,
    message: '',
    data: {
      pageIndex: 0, // 当前页索引	integer(int64)
      pageSize: 10, // 每页大小	integer(int64)
      totalNum: 100, // 总条数,没查总条数则为-1	integer(int64)
      totalPage: 10, // 总页数	integer(int64)
      'rows|10': [
        {
          name: '@cname(2,3)', // 名称	string
          fullName: '@cname(2,3)', // 名称	string
          loginName: '@title(2,3)',
          tel: '@integer(10000000000,19999999999)',
          qq: '@integer(10000000000,19999999999)',
          createTime: '@datetime',
          email: '@email',
          collectType: '@integer(1,2)', // 采集类型（1、全量采集，默认；2、可视化埋点）	string
          description: '@ctitle(20,40)', // 描述	string
          id: '@uuid', // 应用ID	string
          'gender|1': ['男', '女'],
          remark: '@ctitle(5,10)', // 备注	string
          'status|1': ['启用', '停用'] // 状态
        }
      ]
    }
  },
  '/example/getDetails': {
    status: true,
    code: 10000,
    message: '',
    data: { signingStage: 3 } // 签约流程步骤控制字段
  },
  '/example/updateStatus': {
    status: true,
    code: 10000,
    message: '',
    data: {}
  },
  '/example/delete': {
    status: true,
    code: 10000,
    message: '',
    data: {}
  },
  '/example/update': {
    status: true,
    code: 10000,
    message: '',
    data: {}
  },
  '/example/add': {
    status: true,
    code: 10000,
    message: '',
    data: {}
  },
  '/example/updateThemeConfig': {
    status: true,
    code: 10000,
    message: '',
    data: {}
  },
  '/example/commonMockUrl': {
    status: true,
    code: 10000,
    message: '',
    data: {}
  },
}
