import { TG_MATERIAL_CATEGORY } from '@/components/TGDesigner/materials'
import { Button, Divider, Image, Input, TypographyText } from 'ant-design-vue'
import getPropertyField from '@/components/TGDesigner/properties'

export default [
  {
    type: 'a-button',
    category: TG_MATERIAL_CATEGORY.BASIC,
    icon: '',
    preview: props => <Button {...props}>{props.slot}</Button>,
    defaultProps: {
      type: 'primary',
      slot: '按钮'
    },
    style: {
      width: '',
      height: ''
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
              title: '按钮文本',
              label: '按钮文本',
              prop: 'slot'
            })
          ]
        },
        {
          label: '外观',
          items: [
            getPropertyField('select', {
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
  },
  {
    type: 'a-input',
    category: TG_MATERIAL_CATEGORY.BASIC,
    icon: '',
    preview: props => <Input {...props} readonly={props.previewType !== 'preview'} />,
    defaultProps: {
      placeholder: '请输入'
    },
    style: {
      width: '100%'
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
          label: '外观',
          items: [
            getPropertyField('input', {
              title: '文本框占位符',
              label: '占位符',
              prop: 'placeholder'
            })
          ]
        }
      ]
    }
  },
  {
    type: 'a-typography-text',
    category: TG_MATERIAL_CATEGORY.BASIC,
    icon: '',
    preview: props => <TypographyText {...props}>{props.slot}</TypographyText>,
    defaultProps: {
      slot: '这里是文本内容...',
      underline: false,
      type: '',
      strong: false,
      mark: false,
      delete: false,
      ellipsis: false
    },
    style: {
      width: 'auto',
      height: 'auto',
      fontSize: 14
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
              title: '文本内容（最大长度限制100）',
              label: '文本内容',
              prop: 'slot',
              props: {
                maxLength: 100,
                placeholder: '无'
              }
            })
          ]
        },
        {
          label: '外观',
          items: [
            getPropertyField('inputNumber', {
              title: '字号',
              label: '字号',
              prop: 'fontSize'
            }),
            getPropertyField('switch', {
              title: '下划线',
              label: '下划线',
              prop: 'underline',
              modelProp: 'checked'
            }),
            getPropertyField('select', {
              title: '文本类型',
              label: '文本类型',
              prop: 'type',
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
            getPropertyField('switch', {
              title: '加粗',
              label: '加粗',
              prop: 'strong',
              modelProp: 'checked'
            }),
            getPropertyField('switch', {
              title: '标记',
              label: '标记',
              prop: 'mark',
              modelProp: 'checked'
            }),
            getPropertyField('switch', {
              title: '删除线',
              label: '删除线',
              prop: 'delete',
              modelProp: 'checked'
            }),
            getPropertyField('switch', {
              title: '自动溢出省略（需要配合宽度使用，当文本内容超过设置的宽度后生效）',
              label: '自动溢出省略',
              prop: 'ellipsis',
              modelProp: 'checked'
            })
          ]
        }
      ]
    }
  },
  {
    type: 'a-divider',
    category: TG_MATERIAL_CATEGORY.BASIC,
    icon: '',
    preview: props => <Divider {...props}>{props.slot}</Divider>,
    defaultProps: {
      slot: '分割线',
      dashed: false,
      orientation: 'center',
      plain: false,
      type: 'horizontal'
    },
    style: {
      width: '100%',
      height: 'auto'
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
              title: '分割线标题（显示在线条上的文本内容，最大长度限制10）',
              label: '分割线标题',
              prop: 'slot',
              props: {
                maxLength: 10,
                placeholder: '无'
              }
            })
          ]
        },
        {
          label: '外观',
          items: [
            getPropertyField('switch', {
              title: '虚线',
              label: '虚线',
              prop: 'dashed',
              modelProp: 'checked'
            }),
            getPropertyField('radioGroup', {
              title: '分割线标题位置',
              label: '标题位置',
              prop: 'orientation',
              props: {
                options: [
                  { label: '左侧', value: 'left' },
                  { label: '中间', value: 'center' },
                  { label: '右侧', value: 'right' }
                ]
              }
            }),
            getPropertyField('switch', {
              title: '普通文本',
              label: '普通文本',
              prop: 'plain',
              modelProp: 'checked'
            }),
            getPropertyField('radioGroup', {
              title: '分割线的方向',
              label: '方向',
              prop: 'type',
              props: {
                options: [
                  { label: '水平', value: 'horizontal' },
                  { label: '垂直', value: 'vertical' }
                ]
              }
            })
          ]
        }
      ]
    }
  },
  {
    type: 'a-image',
    category: TG_MATERIAL_CATEGORY.BASIC,
    icon: '',
    preview: props => <Image {...props} />,
    defaultProps: {
      placeholder: true,
      preview: false,
      // src: 'https://aliyuncdn.antdv.com/vue.png',
      src: '',
      fallback: 'data:image/png;base64,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'
    },
    style: {
      width: 100,
      height: 100
    },
    class: 'tg-designer-basic-image',
    configForm: {
      fields: [
        {
          label: '尺寸',
          items: [
            getPropertyField('inputNumber', {
              label: '宽度',
              title: '容器宽度（像素单位）',
              prop: 'width',
              props: {
                placeholder: '自适应'
              }
            }),
            getPropertyField('inputNumber', {
              label: '高度',
              title: '容器高度（像素单位）',
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
              label: '图片地址',
              title: '图片地址（img标签支持的图片格式）',
              prop: 'src',
              props: {
                placeholder: '图片地址',
                maxLength: 100
              }
            })
          ]
        }
      ]
    }
  }
]
