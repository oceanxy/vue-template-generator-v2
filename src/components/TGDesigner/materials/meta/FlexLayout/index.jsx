import { Flex } from 'ant-design-vue'
import { TG_MATERIAL_CATEGORY } from '@/components/TGDesigner/materials'
import { omit, range } from 'lodash'
import getPropertyField from '@/components/TGDesigner/properties'

/**
 * 组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-layout-flex',
  category: TG_MATERIAL_CATEGORY.LAYOUT,
  icon: '',
  preview: FlexLayoutPreview,
  defaultProps: {
    gap: 8,
    vertical: false,
    wrap: 'nowrap',
    style: {
      width: '100%',
      height: 'auto',
      alignItems: 'stretch',
      justifyContent: 'flex-start'
    }
  },
  style: {
    padding: 8,
    backgroundColor: '#f0f2f5',
    border: '1px dashed #d9d9d9'
  },
  children: [],
  configForm: {
    fields: [
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
      }),
      getPropertyField('radioGroup', {
        label: '方向',
        title: '组件排列方向（flex-direction）',
        prop: 'vertical',
        props: {
          optionType: 'button',
          options: [
            { label: '水平排列', value: false },
            { label: '垂直排列', value: true }
          ]
        }
      }),
      getPropertyField('radioGroup', {
        label: '自动换行',
        title: '自动换行（wrap）',
        prop: 'wrap',
        props: {
          optionType: 'button',
          options: [
            { label: '不换行', value: 'nowrap' },
            { label: '自动换行', value: 'wrap' }
          ]
        }
      }),
      getPropertyField('select', {
        label: '交叉轴对齐',
        title: '交叉轴对齐方式（align-items）',
        prop: 'alignItems'
      }),
      getPropertyField('select', {
        label: '主轴对齐',
        title: '主轴对齐方式（justify-content）',
        prop: 'justifyContent'
      }),
      getPropertyField('input', {
        label: '间距',
        title: '间距大小（gap）',
        prop: 'gap',
        props: {
          placeholder: '0px'
        }
      }),
      getPropertyField('input', {
        label: '边距',
        title: '内边距（padding）',
        prop: 'padding',
        props: {
          placeholder: '0px'
        }
      }),
      getPropertyField('colorPicker', {
        label: '背景颜色',
        title: '画布背景颜色（backgroundColor）',
        prop: 'backgroundColor'
      })
    ]
  }
}

export function FlexLayoutPreview(props) {
  const { previewType, children, ...restProps } = props

  if (previewType === 'canvas') {
    return (
      <Flex vertical class={'tg-designer-layout-container'}>
        {
          <Flex
            {...omit(restProps, 'style')}
            {...{
              style: {
                justifyContent: restProps.style.justifyContent,
                alignItems: restProps.style.alignItems
              }
            }}
            class={'tg-designer-drag-placeholder-within-layout'}
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
