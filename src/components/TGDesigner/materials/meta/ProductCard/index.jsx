import { Button } from 'ant-design-vue'
import { ShopOutlined } from '@ant-design/icons-vue'
import { TG_MATERIAL_CATEGORY } from '@/components/TGDesigner/materials'
import getPropertyField from '@/components/TGDesigner/properties'

/**
 * 组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-template-product-card',
  category: TG_MATERIAL_CATEGORY.TEMPLATE,
  icon: <ShopOutlined />,
  preview: props => <ProductCardPreview {...props} />,
  defaultProps: {
    title: '卡片标题'
  },
  style: {
    width: '',
    height: '',
    // margin: '8px',
    // padding: '12px'
    backgroundColor: '#ffffff'
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
        label: '数据',
        items: [
          getPropertyField('input', {
            title: '标题',
            label: '标题',
            prop: 'title'
          })
        ]
      },
      {
        label: '背景',
        items: [
          getPropertyField('colorPicker', {
            title: '背景色',
            label: '背景色',
            prop: 'backgroundColor'
          })
        ]
      }
    ]
  }
}

export const ProductCardPreview = {
  name: 'ProductCard',
  props: ['title'],
  setup(props) {
    return () => (
      <div
        class='tg-designer-product-card'
        style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '12px',
          backgroundColor: props.bgColor
        }}
      >
        <div style={{ fontSize: '16px', marginBottom: '8px' }}>
          {props.title}
        </div>
        <div
          style={{
            height: '60px',
            background: '#f0f0f0',
            marginBottom: '8px',
            padding: '10px'
          }}
        >
          <span>模板组件示例</span>
        </div>
        <Button type="primary" block>立即购买</Button>
      </div>
    )
  }
}
