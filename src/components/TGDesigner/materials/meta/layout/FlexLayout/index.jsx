import { Flex } from 'ant-design-vue'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import getPropertyConfig from '@/components/TGDesigner/properties'
import { range } from 'lodash'

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
  configForm: propertyValues => [
    {
      label: '尺寸',
      items: [
        getPropertyConfig('input', {
          label: '宽度',
          title: '容器宽度：支持填写百分数和数字，填写数字时的单位为屏幕像素（width）',
          prop: 'width',
          layout: 'half',
          props: {
            placeholder: '自适应',
            allowClear: true
          },
          slots: {
            prefix: () => <IconFont type={'icon-designer-property-width'} />
          }
        }),
        getPropertyConfig('input', {
          label: '高度',
          title: '容器高度：支持填写百分数和数字，填写数字时的单位为屏幕像素（height）',
          prop: 'height',
          layout: 'half',
          props: {
            placeholder: '自适应',
            allowClear: true
          },
          slots: {
            prefix: () => <IconFont type={'icon-designer-property-height'} />
          }
        })
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
        getPropertyConfig('segmented', {
          label: '组件分布',
          title: '控制容器内组件在设定的排列方向上如何分布：靠拢或分散（justify-content）',
          prop: 'justifyContent'
        }, propertyValues),
        getPropertyConfig('segmented', {
          label: '组件对齐',
          title: '控制容器内各组件的对齐方式（align-items）',
          prop: 'alignItems'
        }, propertyValues),
        getPropertyConfig('select', {
          label: `多${propertyValues?.style?.flexDirection === 'column' ? '列' : '行'}显示`,
          title: `容器内组件的总宽度超过${
            propertyValues?.style?.flexDirection === 'column' ? '容器高度' : '容器宽度'
          }时${
            propertyValues?.style?.flexDirection === 'column' ? '另起一列' : '另起一行'
          }（flex-wrap）`,
          layout: 'half',
          prop: 'wrap',
          props: {
            options: [
              { label: '否', value: 'nowrap' },
              { label: '是', value: 'wrap' }
            ]
          }
        }),
        getPropertyConfig('input', {
          label: '组件间距',
          title: '各组件间的间隔距离（gap）',
          prop: 'gap',
          layout: 'half',
          props: {
            placeholder: '0px',
            allowClear: true
          },
          slots: {
            prefix: () => <IconFont type={'icon-designer-property-flex-row-gap'} />
          }
        }),
        getPropertyConfig('multiInput', {
          label: '内边距',
          title: '容器的内边距（padding）',
          prop: 'padding',
          props: {
            layout: 'half',
            placeholder: '0px',
            allowClear: true
          },
          slots: {
            all: () => <IconFont type={'icon-designer-property-all'} />,
            tb: () => <IconFont type={'icon-designer-property-padding-tb'} />,
            lr: () => <IconFont type={'icon-designer-property-padding-lr'} />,
            top: () => <IconFont type={'icon-designer-property-padding-top'} />,
            bottom: () => <IconFont type={'icon-designer-property-padding-bottom'} />,
            left: () => <IconFont type={'icon-designer-property-padding-left'} />,
            right: () => <IconFont type={'icon-designer-property-padding-right'} />
          }
        }),
        getPropertyConfig('multiInput', {
          label: '外边距',
          title: '容器的外边距（margin）',
          prop: 'margin',
          props: {
            layout: 'half',
            placeholder: '0px',
            allowClear: true
          },
          slots: {
            all: () => <IconFont type={'icon-designer-property-all'} />,
            tb: () => <IconFont type={'icon-designer-property-margin-tb'} />,
            lr: () => <IconFont type={'icon-designer-property-margin-lr'} />,
            top: () => <IconFont type={'icon-designer-property-margin-top'} />,
            bottom: () => <IconFont type={'icon-designer-property-margin-bottom'} />,
            left: () => <IconFont type={'icon-designer-property-margin-left'} />,
            right: () => <IconFont type={'icon-designer-property-margin-right'} />
          }
        }),
        getPropertyConfig('segmented', {
          label: '容器溢出',
          title: [
            <span>当内容溢出容器设置的宽高时的处理方式（overflow）</span>,
            <span>注意：此属性会受到容器的“宽度”、“高度”、“排列方向”、“多行显示”、“多列显示”等属性的影响</span>
          ],
          prop: 'overflow',
          props: {
            options: [
              {
                label: () => <IconFont type={'icon-designer-property-of-visible'} />,
                value: 'visible',
                title: '默认（visible）'
              },
              {
                label: () => <IconFont type={'icon-designer-property-of-hidden'} />,
                value: 'hidden',
                title: '溢出部分隐藏（hidden）'
              },
              {
                label: () => <IconFont type={'icon-designer-property-of-auto'} />,
                value: 'auto',
                title: '溢出自动隐藏且显示容器滚动条（auto）'
              },
              {
                label: () => <IconFont type={'icon-designer-property-of-x'} />,
                value: 'auto hidden',
                title: '溢出自动隐藏且显示容器X轴滚动条（auto hidden）',
                disabled: propertyValues?.wrap !== 'nowrap'
              },
              {
                label: () => <IconFont type={'icon-designer-property-of-y'} />,
                value: 'hidden auto',
                title: '溢出自动隐藏且自动显示容器Y轴滚动条（hidden auto）',
                disabled: propertyValues?.wrap !== 'nowrap'
              }
            ]
          }
        })
      ]
    },
    {
      label: '背景',
      items: [
        getPropertyConfig('colorPicker', {
          label: '颜色',
          title: '容器的背景颜色（background-color）',
          prop: 'style.backgroundColor'
        }),
        getPropertyConfig('upload', {
          label: '图片',
          title: '容器的背景图片（background-image）',
          prop: 'style.backgroundImage'
        }),
        getPropertyConfig('multiInput', {
          label: '图片尺寸',
          title: '容器背景图片的尺寸（background-size）',
          prop: 'style.backgroundSize',
          props: {
            maxLength: 20,
            layout: 'half',
            placeholder: '自动',
            allowClear: true,
            modes: ['singleValue', 'dualValue']
          },
          slots: {
            all: () => <IconFont type={'icon-designer-property-all'} />,
            tb: () => <IconFont type={'icon-designer-property-width'} />,
            lr: () => <IconFont type={'icon-designer-property-height'} />
          }
        }),
        getPropertyConfig('segmented', {
          label: '图片位置',
          title: '容器背景图片的位置（background-position）',
          prop: 'style.backgroundPosition',
          props: {
            options: [
              {
                label: () => <IconFont type={'icon-designer-property-bp-center'} />,
                value: 'center',
                title: '容器正中央（center）'
              },
              {
                label: () => <IconFont type={'icon-designer-property-bp-top'} />,
                value: 'top',
                title: '紧贴容器顶部（top）'
              },
              {
                label: () => <IconFont type={'icon-designer-property-bp-bottom'} />,
                value: 'bottom',
                title: '紧贴容器底部（bottom）'
              },
              {
                label: () => <IconFont type={'icon-designer-property-bp-left'} />,
                value: 'left',
                title: '紧贴容器左侧（left）'
              },
              {
                label: () => <IconFont type={'icon-designer-property-bp-right'} />,
                value: 'right',
                title: '紧贴容器右侧（right）'
              },
              {
                label: () => <IconFont type={'icon-designer-property-bp-inherit'} />,
                value: 'inherit',
                title: '继承（inherit）'
              }
            ]
          }
        }),
        getPropertyConfig('segmented', {
          label: '图片重复方式',
          title: '容器背景图片的重复方式（background-repeat）',
          prop: 'style.backgroundRepeat',
          props: {
            options: [
              {
                label: () => <IconFont type={'icon-designer-property-br-no-repeat'} />,
                value: 'no-repeat',
                title: '仅显示一张背景图片（no-repeat）'
              },
              {
                label: () => <IconFont type={'icon-designer-property-br-repeat'} />,
                value: 'repeat',
                title: '图像重复显示，但图片可能会被裁剪（repeat）'
              },
              {
                label: () => <IconFont type={'icon-designer-property-br-space'} />,
                value: 'space',
                title: '图像重复且均匀的显示在容器内，不会裁剪图片，但可能会有间隙（space）'
              },
              {
                label: () => <IconFont type={'icon-designer-property-br-round'} />,
                value: 'round',
                title: '图像重复显示，不会裁剪图片，但会自动缩放来消除间隙（round）'
              },
              {
                label: () => <IconFont type={'icon-designer-property-br-repeat-x'} />,
                value: 'repeat-x',
                title: '图像沿X轴方向重复显示（repeat-x）'
              },
              {
                label: () => <IconFont type={'icon-designer-property-br-repeat-y'} />,
                value: 'repeat-y',
                title: '图像沿Y轴方向重复显示（repeat-x）'
              }
            ]
          }
        })
      ]
    }
  ]
}

export function FlexLayoutPreview(props) {
  const { previewType, children, ...restProps } = props

  if (restProps.style.backgroundImage && !restProps.style.backgroundImage.startsWith('url(')) {
    restProps.style.backgroundImage = `url(${restProps.style.backgroundImage})`
  }

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
