import { TrophyOutlined } from '@ant-design/icons-vue'
import getPropertyField from '@/components/TGDesigner/properties'
import { TG_MATERIAL_CATEGORY } from '@/components/TGDesigner/materials'
import './index.scss'

/**
 * 主奖项名称模板组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-template-main-award',
  category: TG_MATERIAL_CATEGORY.TEMPLATE,
  icon: <TrophyOutlined />,
  preview: props => {
    if (props.previewType !== 'material') {
      return <MainAwardPreview {...props} />
    }

    return <div>主奖项</div>
  },
  defaultProps: {
    mainAwardName: '主奖项名称',
    foundingYear: '2021年',
    subAwards: '子奖项名称，子奖项名称，子奖项名称',
    organizer: '中国科协培训和人才服务中心',
    description: '中国大学生机械工程创新创意大赛智能制造赛是由中国机械工程学会于2018年开始创办的国家级学科竞赛，' +
      '从2021年开始已列入中国高等教育学会发布的“全国普通高校大学生竞赛排行榜竞赛项目名单”。' +
      '大赛旨在推动智能制造先进理念传播及技术应用，为智能制造人才教育确立风向标，' +
      '加快培养和选拔符合产业需求的创新型复合人才及系统型人才，提升智能制造领域的创新能力，' +
      '推动中国智能制造的可持续发展。'
  },
  style: {
    width: '100%',
    backgroundColor: ''
  },
  class: '',
  configForm: {
    fields: [
      {
        label: '基本信息',
        items: [
          getPropertyField('input', {
            label: '主奖项名称',
            title: '主奖项名称',
            prop: 'mainAwardName'
          }),
          getPropertyField('input', {
            label: '创办时间',
            title: '创办时间',
            prop: 'foundingYear'
          }),
          getPropertyField('input', {
            label: '子奖项',
            title: '子奖项',
            prop: 'subAwards'
          }),
          getPropertyField('input', {
            label: '主办单位',
            title: '主办单位',
            prop: 'organizer'
          })
        ]
      },
      {
        label: '简介',
        items: [
          getPropertyField('textarea', {
            label: '描述',
            title: '描述',
            prop: 'description'
          })
        ]
      }
    ]
  }
}

export const MainAwardPreview = {
  name: 'MainAward',
  props: ['mainAwardName', 'foundingYear', 'subAwards', 'organizer', 'description'],
  setup(props) {
    return () => (
      <div class="tg-designer-main-award">
        <div class="tg-main-award-header">
          <h1>{props.mainAwardName}</h1>
          <p>创办时间：{props.foundingYear}</p>
          <p>子奖项：{props.subAwards}</p>
          <p>主办单位：{props.organizer}</p>
        </div>
        <div class="tg-main-award-content">
          <div class="tg-main-award-description">
            <h2>简介</h2>
            <p>{props.description}</p>
          </div>
          <div class="tg-main-award-button">
            <button>去申报</button>
          </div>
        </div>
      </div>
    )
  }
}
