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
  name: '图文列表',
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
              placeholder: '自适应'
            }
          }),
          getPropertyField('input', {
            label: '高度',
            title: '容器高度（支持像素单位，默认自适应）',
            prop: 'height',
            props: {
              placeholder: '自适应'
            }
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
              maxLength: 250
            }
          }),
          getPropertyField('input', {
            label: '图片尺寸',
            title: '背景图片尺寸(background-size)',
            prop: 'backgroundSize',
            props: {
              maxLength: 20,
              placeholder: '自动'
            }
          }),
          getPropertyField('input', {
            label: '图片位置',
            title: '背景图片位置(background-position)',
            prop: 'backgroundPosition',
            props: {
              maxLength: 20
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
