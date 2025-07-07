import { Image } from 'ant-design-vue'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import { defaultImg } from '@/components/TGDesigner/assets/defaultImg'
import { predefinedProperties } from '@/components/TGDesigner/properties'
import './index.scss'

export default {
  type: 'a-image',
  category: TG_MATERIAL_CATEGORY.BASIC,
  name: '图片',
  preview: props => {
    if (props.previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
      return <IconFont type="icon-designer-material-picture" />
    }

    return (
      <Image
        {...props}
        fallback={defaultImg}
        placeholder={true}
        preview={false}
      />
    )
  },
  defaultProps: {
    // src: 'https://aliyuncdn.antdv.com/vue.png',
    src: ''
  },
  style: {
    width: '',
    height: ''
  },
  class: 'tg-designer-basic-image',
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
        predefinedProperties.upload({
          label: '图片',
          title: '图片地址（img标签支持的图片地址）',
          prop: 'src'
        })
      ]
    }
  ]
}
