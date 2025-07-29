import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import getPropertyConfig, { predefinedProperties } from '@/components/TGDesigner/properties'
import { QRCode } from 'ant-design-vue'

export default {
  type: 'a-qrcode',
  category: TG_MATERIAL_CATEGORY.BASIC,
  name: '二维码',
  preview: props => {
    if (props.previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
      return <IconFont type="icon-designer-material-qrcode" />
    }

    return <QRCode {...props} />
  },
  defaultProps: {
    value: '',
    icon: '',
    size: 160,
    iconSize: 40,
    bgColor: '#ffffff',
    color: '#000000',
    status: 'active' // active | expired | loading | scanned
  },
  style: {},
  class: 'tg-designer-basic-qrcode',
  propConfigForm: [
    {
      label: '尺寸',
      items: [
        getPropertyConfig('inputNumber', {
          label: '尺寸',
          title: '二维码的宽度和高度值（单位为像素）',
          prop: 'size',
          layout: 'half'
        })
      ]
    },
    {
      label: '数据',
      items: [
        getPropertyConfig('input', {
          label: '扫描结果',
          title: '扫描二维码后得到的数据（最大限制100字符）',
          prop: 'value',
          props: {
            placeholder: '请输入数据',
            maxLength: 100,
            allowClear: true
          }
        }),
        getPropertyConfig('select', {
          title: '二维码状态',
          label: '二维码状态',
          prop: 'status',
          layout: 'half',
          props: {
            options: [
              { label: '正常', value: 'active' },
              { label: '已过期', value: 'expired' },
              { label: '加载中', value: 'loading' },
              { label: '已扫描', value: 'scanned' }
            ]
          }
        })
      ]
    },
    {
      label: '外观',
      items: [
        predefinedProperties.upload({
          label: '二维码图片',
          title: '显示在二维码中央的图片的地址',
          prop: 'icon'
        }),
        getPropertyConfig('colorPicker', {
          title: '二维码颜色',
          label: '二维码颜色',
          prop: 'color',
          props: {
            defaultValue: '#000000'
          }
        }),
        getPropertyConfig('colorPicker', {
          title: '背景色',
          label: '背景色',
          prop: 'bgColor',
          props: {
            defaultValue: '#ffffff'
          }
        })
      ]
    }
  ]
}
