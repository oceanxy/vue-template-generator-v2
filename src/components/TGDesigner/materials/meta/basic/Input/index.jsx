import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import getPropertyConfig, { predefinedProperties } from '@/components/TGDesigner/properties'
import { Input } from 'ant-design-vue'

export default {
  type: 'a-input',
  category: TG_MATERIAL_CATEGORY.BASIC,
  name: '文本框',
  preview: props => {
    if (props.previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
      return <IconFont type="icon-designer-material-input" />
    }

    return <Input {...props} readonly={props.previewType !== TG_MATERIAL_PREVIEW_TYPE.PREVIEW} />
  },
  defaultProps: {
    placeholder: '请输入'
  },
  style: {
    width: '100%'
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
      label: '外观',
      items: [
        getPropertyConfig('input', {
          title: '文本框占位符',
          label: '占位符',
          prop: 'placeholder',
          props: {
            allowClear: true
          }
        })
      ]
    }
  ]
}
