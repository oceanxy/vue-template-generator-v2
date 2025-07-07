import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import getPropertyConfig, { predefinedProperties } from '@/components/TGDesigner/properties'
import { TypographyText } from 'ant-design-vue'

export default {
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
}
