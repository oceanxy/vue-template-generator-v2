import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import { Button, Divider, Image, Input, QRCode, TypographyText } from 'ant-design-vue'
import getPropertyConfig, { predefinedProperties } from '@/components/TGDesigner/properties'
import { defaultImg } from '@/components/TGDesigner/assets/defaultImg'
import Menu from './Menu'

export default [
  {
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
  },
  {
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
  },
  {
    type: 'a-typography-text',
    category: TG_MATERIAL_CATEGORY.BASIC,
    name: '文本',
    preview: props => {
      if (props.previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
        return <IconFont type="icon-designer-material-text" />
      }

      if (props.italic) {
        props.style.fontStyle = 'italic'
      }

      return (
        <TypographyText
          {...props}
          content={props.slot}
        />
      )
    },
    defaultProps: {
      slot: '文本内容...',
      underline: false,
      type: '',
      strong: false,
      mark: false,
      delete: false,
      ellipsis: false,
      italic: false
    },
    style: {
      width: '',
      height: '',
      fontSize: 14,
      lineHeight: '',
      color: ''
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
            title: '文本内容（最大长度限制100）',
            label: '文本内容',
            prop: 'slot',
            props: {
              maxLength: 100,
              placeholder: '无',
              allowClear: true
            }
          })
        ]
      },
      {
        label: '外观',
        items: [
          getPropertyConfig('inputNumber', {
            title: '字号',
            label: '字号',
            prop: 'fontSize',
            layout: 'half'
          }),
          getPropertyConfig('input', {
            title: '行高',
            label: '行高',
            prop: 'lineHeight',
            layout: 'half',
            props: {
              placeholder: '默认',
              allowClear: true
            }
          }),
          getPropertyConfig('select', {
            title: '文本类型',
            label: '文本类型',
            prop: 'type',
            layout: 'half',
            props: {
              options: [
                { label: '主文本', value: '' },
                { label: '次级文本', value: 'secondary' },
                { label: '成功', value: 'success' },
                { label: '警告', value: 'warning' },
                { label: '失败', value: 'danger' }
              ]
            }
          }),
          getPropertyConfig('colorPicker', {
            label: '颜色',
            title: '文字的颜色（color）',
            prop: 'color',
            props: {
              placeholder: '无',
              allowClear: true
            }
          }),
          getPropertyConfig('multiSelect', {
            label: '样式',
            title: '',
            prop: '{props}',
            props: {
              returnObject: true,
              options: [
                {
                  label: () => <IconFont type={'icon-designer-property-italic'} />,
                  value: 'italic',
                  title: '斜体'
                },
                {
                  label: () => <IconFont type={'icon-designer-property-underline'} />,
                  value: 'underline',
                  title: '下划线'
                },
                {
                  label: () => <IconFont type={'icon-designer-property-delete'} />,
                  value: 'delete',
                  title: '删除线'
                },
                {
                  label: () => <IconFont type={'icon-designer-property-strong'} />,
                  value: 'strong',
                  title: '加粗'
                },
                {
                  label: () => <IconFont type={'icon-designer-property-mark'} />,
                  value: 'mark',
                  title: '标记'
                },
                {
                  label: () => <IconFont type={'icon-designer-property-ellipsis'} />,
                  value: 'ellipsis',
                  title: '文字溢出自动显示省略号。当文本内容超过设置的宽度后生效'
                }
              ]
            }
          })
        ]
      }
    ]
  },
  {
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
  },
  {
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
  },
  {
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
  },
  Menu
]
