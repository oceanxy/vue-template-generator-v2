import getPropertyField from '@/components/TGDesigner/properties'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import { TypographyParagraph } from 'ant-design-vue'
import './index.scss'

/**
 * 主奖项名称模板组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-template-main-award',
  category: TG_MATERIAL_CATEGORY.TEMPLATE,
  name: '主奖项',
  preview: props => {
    if (props.previewType !== TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
      return <MainAwardPreview {...props} />
    }

    return <IconFont type="icon-designer-material-main-award" />
  },
  defaultProps: {},
  style: {
    width: '100%',
    height: '',
    backgroundColor: '',
    backgroundImage: '',
    backgroundSize: '',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  class: '',
  configForm: {
    fields: [
      {
        label: '尺寸',
        items: [
          getPropertyField('input', {
            label: '宽度',
            title: '容器宽度（支持百分比和像素单位）',
            prop: 'width',
            props: {
              placeholder: '自适应',
              allowClear: true
            }
          }),
          getPropertyField('input', {
            label: '高度',
            title: '容器高度（支持像素单位，默认自适应）',
            prop: 'height',
            props: {
              placeholder: '自适应',
              allowClear: true
            }
          })
        ]
      },
      {
        label: '背景',
        items: [
          getPropertyField('colorPicker', {
            label: '颜色',
            title: '背景颜色(background-color)',
            prop: 'backgroundColor'
          }),
          getPropertyField('input', {
            label: '图片',
            title: '背景图片(background-image)',
            prop: 'backgroundImage',
            props: {
              placeholder: '请输入图片地址',
              maxLength: 250,
              allowClear: true
            }
          }),
          getPropertyField('input', {
            label: '图片尺寸',
            title: '背景图片尺寸(background-size)',
            prop: 'backgroundSize',
            props: {
              maxLength: 20,
              placeholder: '自动',
              allowClear: true
            }
          }),
          getPropertyField('input', {
            label: '图片位置',
            title: '背景图片位置(background-position)',
            prop: 'backgroundPosition',
            props: {
              maxLength: 20,
              allowClear: true
            }
          }),
          getPropertyField('select', {
            label: '图片重复',
            title: '背景图片重复(background-repeat)',
            prop: 'backgroundRepeat',
            props: {
              options: [
                { label: '不重复', value: 'no-repeat', title: 'no-repeat' },
                { label: '重复(裁剪&全覆盖)', value: 'repeat', title: 'repeat' },
                { label: '重复(不裁剪&非全覆盖)', value: 'space', title: 'space' },
                { label: '重复(伸缩铺满)', value: 'round', title: 'round' },
                { label: '沿X轴重复', value: 'repeat-x', title: 'repeat-x' },
                { label: '沿Y轴重复', value: 'repeat-y', title: 'repeat-y' }
              ]
            }
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
    const data = {
      mainAwardName: '主奖项名称',
      foundingYear: '2021年',
      subAwards: '子奖项名称',
      organizer: '中国科协培训和人才服务中心',
      description: '中国大学生机械工程创新创意大赛智能制造赛是由中国机械工程学会于2018年开始创办的国家级学科竞赛，' +
        '从2021年开始已列入中国高等教育学会发布的“全国普通高校大学生竞赛排行榜竞赛项目名单”。' +
        '大赛旨在推动智能制造先进理念传播及技术应用，为智能制造人才教育确立风向标，' +
        '加快培养和选拔符合产业需求的创新型复合人才及系统型人才，提升智能制造领域的创新能力，' +
        '推动中国智能制造的可持续发展。'
    }

    return () => (
      <div class="tg-designer-main-award">
        <div class="tg-main-award-header">
          <h1>{data.mainAwardName}</h1>
          <p>创办时间：{data.foundingYear}</p>
          <p>子奖项：{data.subAwards}</p>
          <p>主办单位：{data.organizer}</p>
        </div>
        <div class="tg-main-award-content">
          <div class="tg-main-award-description">
            <h2>简介</h2>
            <TypographyParagraph
              content={data.description}
              ellipsis={{ rows: 4 }}
            />
          </div>
          <div class="tg-main-award-button">
            <button>去申报</button>
          </div>
        </div>
      </div>
    )
  }
}
