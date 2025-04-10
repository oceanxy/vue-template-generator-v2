import { Flex, InputNumber, RadioGroup, Select, Switch } from 'ant-design-vue'
import { TG_MATERIAL_CATEGORY } from '@/components/TGEditor/materials'
import { omit, range } from 'lodash'
import TGColorPicker from '@/components/TGColorPicker'

/**
 * 组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-flex-layout',
  category: TG_MATERIAL_CATEGORY.LAYOUT,
  icon: '',
  preview: FlexLayoutPreview,
  defaultProps: {
    gap: 'small',
    vertical: false,
    wrap: 'nowrap',
    align: 'normal',
    justify: 'normal'
  },
  style: {
    padding: 8,
    backgroundColor: '#f0f2f5',
    border: '1px dashed #d9d9d9'
  },
  children: [],
  configForm: {
    fields: [
      {
        type: 'select',
        title: '排列方向',
        label: '方向',
        prop: 'vertical',
        modelProp: 'checked',
        component: () => Switch,
        props: {
          checkedChildren: '垂直',
          unCheckedChildren: '水平'
        }
      },
      {
        type: 'select',
        title: '间距大小',
        label: '间距',
        prop: 'gap',
        modelProp: 'value',
        component: () => Select,
        props: {
          options: [
            { label: '小', value: 'small' },
            { label: '中', value: 'middle' },
            { label: '大', value: 'large' }
          ]
        }
      },
      {
        type: 'radio',
        title: '自动换行（wrap）',
        label: '自动换行',
        prop: 'wrap',
        modelProp: 'value',
        component: () => RadioGroup,
        props: {
          optionType: 'button',
          options: [
            { label: '不换行', value: 'nowrap' },
            { label: '自动换行', value: 'wrap' }
          ]
        }
      },
      {
        type: 'select',
        title: '交叉轴对齐方式（align-items）',
        label: '水平对齐方式',
        prop: 'align',
        modelProp: 'value',
        component: () => Select,
        props: {
          options: [
            { label: '自动', value: 'normal' },
            { label: '居中', value: 'center' },
            { label: '左对齐', value: 'flex-start' },
            { label: '右对齐', value: 'flex-end' },
            { label: '填满', value: 'stretch' }
          ]
        }
      },
      {
        type: 'select',
        title: '主轴对齐方式（justify-content）',
        label: '垂直对齐方式',
        prop: 'justify',
        modelProp: 'value',
        component: () => Select,
        props: {
          options: [
            { label: '自动', value: 'normal' },
            { label: '居中', value: 'center' },
            { label: '顶部对齐', value: 'flex-start' },
            { label: '底部对齐', value: 'flex-end' },
            { label: '填满', value: 'stretch' },
            { label: '均分', value: 'space-between' },
            { label: '均分并居中', value: 'space-around' },
            { label: '两端对齐', value: 'space-evenly' }
          ]
        }
      },
      {
        type: 'number',
        label: '边距',
        title: '内边距（padding）',
        prop: 'padding',
        modelProp: 'value',
        component: () => InputNumber
      },
      {
        type: 'color',
        label: '背景颜色',
        title: '画布背景颜色（backgroundColor）',
        prop: 'backgroundColor',
        modelProp: 'value',
        component: () => TGColorPicker
      }
    ]
  }
}

export function FlexLayoutPreview(props) {
  const { previewType, children, ...restProps } = props

  if (previewType === 'canvas') {
    return (
      <Flex
        class={'tg-editor-layout-container'}
        vertical
        style={restProps.style}
      >
        {
          <Flex
            {...omit(restProps, 'style')}
            class={'tg-editor-drag-placeholder-within-layout'}
          >
            {children?.length ? children : ' '}
          </Flex>
        }
      </Flex>
    )
  } else if (previewType === 'material') {
    return (
      <Flex {...restProps} gap={8} wrap={'wrap'}>
        {
          range(0, 4, 1).map(c => (
            <div
              style={{
                background: '#d5d5d5',
                minHeight: '20px',
                width: 'calc((100% - 16px) / 3)'
              }}
            />
          ))
        }
      </Flex>
    )
  }

  return (
    <Flex {...restProps} >
      {children}
    </Flex>
  )
}
