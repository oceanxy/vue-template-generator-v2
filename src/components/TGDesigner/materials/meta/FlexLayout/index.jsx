import { Flex } from 'ant-design-vue'
import { TG_MATERIAL_CATEGORY } from '@/components/TGDesigner/materials'
import { range } from 'lodash'
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
    style: {}
  },
  style: {
    width: '100%',
    height: 'auto',
    padding: 16,
    border: '1px dashed #d9d9d9',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: '#f0f2f5',
    // backgroundImage: 'https://aliyuncdn.antdv.com/vue.png',
    backgroundImage: '',
    backgroundSize: '100% 100%',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  children: [],
  configForm: {
    fields: [
      {
        label: '尺寸',
        items: [
          getPropertyField('input', {
            label: '宽度',
            title: '容器宽度(支持百分比和像素单位)',
            prop: 'width',
            props: {
              placeholder: '自适应'
            }
          }),
          getPropertyField('input', {
            label: '高度',
            title: '容器高度(支持像素单位，默认自适应)',
            prop: 'height',
            props: {
              placeholder: '自适应'
            }
          })
        ]
      },
      {
        label: '布局',
        items: [
          getPropertyField('radioGroup', {
            label: '方向',
            title: '组件排列方向(flex-direction)',
            prop: 'vertical',
            props: {
              options: [
                { label: '水平排列', value: false },
                { label: '垂直排列', value: true }
              ]
            }
          }),
          getPropertyField('radioGroup', {
            label: '自动换行',
            title: '自动换行(wrap)',
            prop: 'wrap',
            props: {
              options: [
                { label: '不换行', value: 'nowrap' },
                { label: '自动换行', value: 'wrap' }
              ]
            }
          }),
          getPropertyField('select', {
            label: '交叉轴',
            title: '交叉轴对齐方式(align-items)',
            prop: 'alignItems'
          }),
          getPropertyField('select', {
            label: '主轴',
            title: '主轴对齐方式(justify-content)',
            prop: 'justifyContent'
          }),
          getPropertyField('input', {
            label: '组件间距',
            title: '内部组件间的距离(gap)',
            prop: 'gap',
            props: {
              placeholder: '0px'
            }
          }),
          getPropertyField('input', {
            label: '内边距',
            title: '容器的内边距(padding)',
            prop: 'padding',
            props: {
              placeholder: '0px'
            }
          })
        ]
      },
      {
        label: '背景',
        items: [
          getPropertyField('colorPicker', {
            label: '颜色',
            title: '背景颜色(background-color)',
            prop: 'backgroundColor'
          }),
          getPropertyField('input', {
            label: '图片',
            title: '背景图片(background-image)',
            prop: 'backgroundImage',
            props: {
              placeholder: '请输入图片地址',
              maxLength: 250
            }
          }),
          getPropertyField('input', {
            label: '图片尺寸',
            title: '背景图片尺寸(background-size)',
            prop: 'backgroundSize',
            props: {
              maxLength: 20
            }
          }),
          getPropertyField('input', {
            label: '图片位置',
            title: '背景图片位置(background-position)',
            prop: 'backgroundPosition',
            props: {
              maxLength: 20
            }
          }),
          getPropertyField('select', {
            label: '图片重复',
            title: '背景图片重复(background-repeat)',
            prop: 'backgroundRepeat',
            props: {
              options: [
                { label: '不重复', value: 'no-repeat', title: 'no-repeat' },
                { label: '重复(裁剪&全覆盖)', value: 'repeat', title: 'repeat' },
                { label: '重复(不裁剪&非全覆盖)', value: 'space', title: 'space' },
                { label: '重复(伸缩铺满)', value: 'round', title: 'round' },
                { label: '沿X轴重复', value: 'repeat-x', title: 'repeat-x' },
                { label: '沿Y轴重复', value: 'repeat-y', title: 'repeat-y' }
              ]
            }
          })
        ]
      }
    ]
  }
}

export function FlexLayoutPreview(props) {
  const { previewType, children, ...restProps } = props

  if (restProps.style.backgroundImage && !restProps.style.backgroundImage.startsWith('url(')) {
    restProps.style.backgroundImage = `url(${restProps.style.backgroundImage})`
  }

  if (previewType === 'material') {
    restProps.style.backgroundImage = 'unset'

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
    <Flex
      {...restProps}
      style={restProps.style}
      class={{
        'tg-designer-layout-container': true,
        'has-background-image': !!restProps.style.backgroundImage
      }}
    >
      {children?.length ? children : ' '}
    </Flex>
  )
}
