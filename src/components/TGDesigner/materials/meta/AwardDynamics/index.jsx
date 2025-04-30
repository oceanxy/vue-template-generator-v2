import { TrophyOutlined } from '@ant-design/icons-vue'
import getPropertyField from '@/components/TGDesigner/properties'
import { TG_MATERIAL_CATEGORY } from '@/components/TGDesigner/materials'
import { Button, TypographyParagraph } from 'ant-design-vue'
import './index.scss'
import { defaultImg } from '@/components/TGDesigner/assets/defaultImg'

/**
 * 奖项动态模板组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-template-award-dynamics',
  category: TG_MATERIAL_CATEGORY.TEMPLATE,
  icon: <TrophyOutlined />,
  preview: props => {
    if (props.previewType !== 'material') {
      return <AwardDynamics {...props} />
    }

    return <div>动态奖项</div>
  },
  defaultProps: {
    title: '奖项动态',
    description: '了解更多动态资讯，点击查看更多动态',
    highlightFirstItem: true,
    items: [
      {
        id: 1,
        image: defaultImg,
        title: '动态标题',
        content: '动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容'
      },
      {
        id: 2,
        image: defaultImg,
        title: '动态标题',
        content: '动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容'
      },
      {
        id: 3,
        image: defaultImg,
        title: '动态标题',
        content: '动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容'
      },
      {
        id: 4,
        image: defaultImg,
        title: '动态标题',
        content: '动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容'
      },
      {
        id: 5,
        image: defaultImg,
        title: '动态标题',
        content: '动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容动态内容'
      }
    ]
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
            label: '标题',
            title: '标题',
            prop: 'title'
          }),
          getPropertyField('input', {
            label: '描述',
            title: '描述',
            prop: 'description'
          })
        ]
      },
      {
        label: '布局',
        items: [
          getPropertyField('switch', {
            label: '突出第一条数据',
            title: '突出展示第一条数据',
            prop: 'highlightFirstItem',
            modelProp: 'checked'
          })
        ]
      }
    ]
  }
}

export const AwardDynamics = {
  name: 'AwardDynamics',
  props: ['title', 'description', 'items', 'highlightFirstItem'],
  setup(props) {
    function RenderItem(props) {
      const dataSource = props.dataSource

      return (
        <div class="tg-award-dynamics-item">
          <img src={dataSource.image} alt={`奖项动态 ${dataSource.id}`} />
          <div class="tg-award-dynamics-item-content">
            <div class="tg-adc-title">{dataSource.title}</div>
            <TypographyParagraph
              class="tg-adc-content"
              ellipsis={{ rows: 2 }}
              content={dataSource.content}
            />
          </div>
        </div>
      )
    }

    function RenderMoreButton() {
      if (props.items.length > 4) {
        return (
          <div class="tg-award-dynamics-more">
            <Button type="primary" ghost size="large">更多动态</Button>
          </div>
        )
      }

      return null
    }

    const RenderItems = () => {
      if (props.highlightFirstItem && props.items.length > 1) {
        const firstItem = props.items[0]
        const otherItems = props.items.slice(1).slice(0, 3)

        return (
          <div class="tg-award-dynamics-content-highlight">
            <RenderItem dataSource={firstItem} class="tg-award-dynamics-item-first" />
            <div class="tg-award-dynamics-items-other">
              {otherItems.map(item => <RenderItem key={item.id} dataSource={item} />)}
            </div>
          </div>
        )
      } else {
        return (
          <div class="tg-award-dynamics-content">
            {props.items?.slice(0, 4).map(item => <RenderItem key={item.id} dataSource={item} />)}
          </div>
        )
      }
    }

    return () => (
      <div class="tg-designer-award-dynamics">
        <div class="tg-award-dynamics-header">
          <div class="tg-award-dynamics-title">
            <span>{props.title}</span>
            <RenderMoreButton />
          </div>
          <div class="tg-award-dynamics-description">{props.description}</div>
        </div>
        <RenderItems />
      </div>
    )
  }
}
