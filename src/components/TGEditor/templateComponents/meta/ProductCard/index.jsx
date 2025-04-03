import { Button, Input } from 'ant-design-vue'
import { ShopOutlined } from '@ant-design/icons-vue'
import { TG_COMPONENT_CATEGORY } from '@/components/TGEditor/templateComponents'
import TGColorPicker from '@/components/TGColorPicker'

/**
 * 模板组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-product-card', // 唯一类型标识（必填）
  category: TG_COMPONENT_CATEGORY.TEMPLATE, // 物料类型
  icon: <ShopOutlined />, // 组件区显示的图标
  preview: props => <ProductCardPreview {...props} />, // 拖拽时的预览组件
  defaultProps: {  // 默认属性值（必填）
    title: '卡片标题'
  },
  style: { // 默认样式
    // margin: '8px',
    // padding: '12px'
    backgroundColor: '#ffffff'
  },
  class: 'tg-editor-product-card',
  configForm: { // 右侧属性面板配置（必填）
    fields: [
      {
        type: 'input',
        title: '标题',
        label: '标题',
        prop: 'title',
        component: () => Input // 对应的antd组件
      },
      {
        type: 'color-picker',
        title: '背景色',
        label: '背景色',
        prop: 'backgroundColor',
        component: () => TGColorPicker
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
