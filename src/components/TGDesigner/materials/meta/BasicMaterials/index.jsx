import { TG_MATERIAL_CATEGORY } from '@/components/TGDesigner/materials'
import { Button, Divider, Image, Input, TypographyText } from 'ant-design-vue'
import getPropertyField from '@/components/TGDesigner/properties'
import { defaultImg } from '@/components/TGDesigner/assets/defaultImg'

export default [
  {
    type: 'a-button',
    category: TG_MATERIAL_CATEGORY.BASIC,
    name: '按钮',
    preview: props => <Button {...props}>{props.slot}</Button>,
    defaultProps: {
      type: 'primary',
      slot: 'Button'
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
    name: '文本框',
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
    name: '文本',
    preview: props => {
      if (props.italic) {
        props.style.fontStyle = 'italic'
      }

      return <TypographyText {...props}>{props.slot}</TypographyText>
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
      width: 'auto',
      height: 'auto',
      fontSize: 14,
      lineHeight: ''
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
            getPropertyField('input', {
              title: '行高',
              label: '行高',
              prop: 'lineHeight',
              props: {
                placeholder: '默认'
              }
            }),
            getPropertyField('switch', {
              title: '斜体',
              label: '斜体',
              prop: 'italic',
              modelProp: 'checked'
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
    name: '分割线',
    preview: props => <Divider {...props}>{props.slot}</Divider>,
    defaultProps: {
      slot: '',
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
    name: '图片',
    preview: props => <Image {...props} />,
    defaultProps: {
      placeholder: true,
      preview: false,
      // src: 'https://aliyuncdn.antdv.com/vue.png',
      src: '',
      fallback: defaultImg
    },
    style: {
      width: '',
      height: ''
    },
    class: 'tg-designer-basic-image',
    configForm: {
      fields: [
        {
          label: '尺寸',
          items: [
            getPropertyField('input', {
              label: '宽度',
              title: '容器宽度（像素单位或百分比）',
              prop: 'width',
              props: {
                placeholder: '自适应'
              }
            }),
            getPropertyField('input', {
              label: '高度',
              title: '容器高度（像素单位或百分比）',
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
