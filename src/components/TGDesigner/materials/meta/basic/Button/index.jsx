import { Button } from 'ant-design-vue'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import getPropertyConfig, { predefinedProperties } from '@/components/TGDesigner/properties'

export default {
  type: 'a-button',
  category: TG_MATERIAL_CATEGORY.BASIC,
  name: '按钮',
  preview: props => {
    if (props.previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
      return <IconFont type="icon-designer-material-button" />
    }

    return <Button {...props}>{props.slot}</Button>
  },
  defaultProps: {
    type: 'primary',
    slot: 'Button'
  },
  style: {
    width: '',
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
          title: '按钮文本，最大限制10个字符',
          label: '按钮文本',
          prop: 'slot',
          props: {
            allowClear: true,
            maxLength: 10,
            placeholder: '请输入按钮文本内容'
          }
        })
      ]
    },
    {
      label: '外观',
      items: [
        getPropertyConfig('select', {
          title: '按钮类型',
          label: '按钮类型',
          prop: 'type',
          props: {
            options: [
              { label: '主要按钮', value: 'primary' },
              { label: '次级按钮', value: 'default' },
              { label: '虚线按钮', value: 'dashed' }
            ]
          }
        })
      ]
    }
  ]
}
