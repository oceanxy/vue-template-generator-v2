import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import getPropertyConfig, { predefinedProperties } from '@/components/TGDesigner/properties'
import { Divider } from 'ant-design-vue'

export default {
  type: 'a-divider',
  category: TG_MATERIAL_CATEGORY.BASIC,
  name: '分割线',
  preview: props => {
    if (props.previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
      return <IconFont type="icon-designer-material-line" />
    }

    return <Divider {...props}>{props.slot}</Divider>
  },
  defaultProps: {
    slot: '',
    dashed: false,
    orientation: 'center',
    plain: false,
    type: 'horizontal'
  },
  style: {
    width: '100%',
    height: ''
  },
  class: '',
  propConfigForm: [
    {
      label: '尺寸',
      items: [
        predefinedProperties.width(),
        predefinedProperties.height()
      ]
    },
    {
      label: '数据',
      items: [
        getPropertyConfig('input', {
          title: '分割线标题（显示在线条上的文本内容，最大长度限制10）',
          label: '分割线标题',
          prop: 'slot',
          props: {
            maxLength: 10,
            placeholder: '无',
            allowClear: true
          }
        })
      ]
    },
    {
      label: '外观',
      items: [
        getPropertyConfig('segmented', {
          label: '标题位置',
          title: '分割线标题位置',
          prop: 'orientation',
          layout: 'half',
          props: {
            options: [
              { label: '左', value: 'left' },
              { label: '中', value: 'center' },
              { label: '右', value: 'right' }
            ]
          }
        }),
        getPropertyConfig('segmented', {
          label: '方向',
          title: '分割线的方向',
          prop: 'type',
          layout: 'half',
          props: {
            options: [
              { label: '水平', value: 'horizontal' },
              { label: '垂直', value: 'vertical' }
            ]
          }
        }),
        getPropertyConfig('multiSelect', {
          label: '样式',
          title: '',
          prop: '{props}',
          layout: 'half',
          props: {
            returnObject: true,
            options: [
              {
                label: '虚',
                value: 'dashed',
                title: '分割线显示为虚线'
              },
              {
                label: () => <IconFont type={'icon-designer-property-strong'} />,
                value: 'plain',
                negate: true,
                title: '文字加粗'
              }
            ]
          }
        })
      ]
    }
  ]
}
