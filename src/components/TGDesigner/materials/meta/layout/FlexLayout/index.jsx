import { Flex } from 'ant-design-vue'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import getPropertyConfig, { predefinedProperties } from '@/components/TGDesigner/properties'
import { range } from 'lodash'
import { formatBackgroundImage } from '@/components/TGDesigner/utils/style'

/**
 * 组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-layout-flex',
  category: TG_MATERIAL_CATEGORY.LAYOUT,
  name: '弹性容器',
  preview: FlexLayoutPreview,
  defaultProps: {
    gap: 8,
    wrap: 'nowrap',
    style: {}
  },
  style: {
    width: '100%',
    height: '',
    padding: 16,
    margin: 0,
    border: '',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    overflow: 'visible',
    backgroundColor: '',
    // backgroundImage: 'https://aliyuncdn.antdv.com/vue.png',
    backgroundImage: '',
    backgroundSize: '',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  class: '',
  children: [],
  canMoveInside: true,
  canCopyInside: true,
  propConfigForm: propertyValues => [
    {
      label: '尺寸',
      items: [
        predefinedProperties.width(),
        predefinedProperties.height()
      ]
    },
    {
      label: '布局',
      items: [
        getPropertyConfig('segmented', {
          label: '排列方向',
          title: '控制容器内元素的排列方向：横向排列或者纵向排列（flex-direction）',
          prop: 'flexDirection',
          props: {
            block: true,
            options: [
              { label: () => <IconFont type={'icon-designer-property-row'} />, value: 'row' },
              { label: () => <IconFont type={'icon-designer-property-column'} />, value: 'column' }
            ]
          }
        }),
        predefinedProperties.justifyContent(null, propertyValues),
        predefinedProperties.alignItems(null, propertyValues),
        predefinedProperties.flexWrap(null, propertyValues),
        predefinedProperties.gap(),
        predefinedProperties.padding(),
        predefinedProperties.margin(),
        predefinedProperties.overflow(null, propertyValues)
      ]
    },
    {
      label: '背景',
      items: predefinedProperties.background(null, propertyValues)
    }
  ]
}

export function FlexLayoutPreview(props) {
  const { previewType, children, ...restProps } = props

  restProps.style.backgroundImage = formatBackgroundImage(restProps.style.backgroundImage)

  if (previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL_PREVIEW) {
    restProps.style.backgroundImage = 'unset'

    return (
      <Flex {...restProps} gap={8} wrap={'wrap'} style={{ padding: '8px' }}>
        {
          range(0, 4, 1).map(c => (
            <div
              style={{
                background: '#d5d5d5',
                minHeight: '16px',
                width: 'calc((100% - 16px) / 3)'
              }}
            />
          ))
        }
      </Flex>
    )
  } else if (previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
    return <IconFont type="icon-designer-material-flex-layout" />
  }

  return (
    <Flex
      {...restProps}
      style={restProps.style}
      class={{
        'tg-designer-layout-container': true,
        'has-background-image': !!restProps.style.backgroundImage || !!restProps.style.backgroundColor
      }}
    >
      {children?.length ? children : ''}
    </Flex>
  )
}
