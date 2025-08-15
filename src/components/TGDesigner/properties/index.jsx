/**
 * @global
 * @typedef TGPropertyConfigGroup
 * @property {string} label - 属性分组名称
 * @property {TGPropertyConfig[]} items - 属性配置
 */

/**
 * @global
 * @typedef TGPropertyConfig
 * @property {string} label - CSS属性名
 * @property {string} title - 鼠标移上显示的完整信息
 * @property {string} prop - 属性标识，指示当前属性控件应该对应组件元数据props中的哪个字段
 * @property {Object} [props={}] - 组件属性
 * @property {Object} [slots={}] - 插槽
 * @property {string} [layout] - 属性控件的布局，可选 'full','half'
 * @property {string} [modelProp] - 属性控件用于接收值的prop
 * @property {any} [component] - 操作属性的组件
 */

import { markRaw } from 'vue'
import { Checkbox, CheckboxGroup, Input, InputNumber, Radio, RadioGroup, Segmented, Select, Switch } from 'ant-design-vue'
import ColorPicker from './components/ColorPicker'
import MultiInput from './components/MultiInput'
import Image from './components/Image'
import MultiSelect from './components/MultiSelect'
import BackgroundImage from './components/BackgroundImage'

export const predefinedProperties = {
  width(props) {
    return getPropertyConfig('input', {
      label: '宽度',
      title: '容器宽度（width）：支持填写百分数和数字，填写数字时的单位为像素',
      prop: 'width',
      layout: 'half',
      ...props,
      props: {
        placeholder: '自适应',
        allowClear: true,
        ...props?.props
      },
      slots: {
        prefix: () => <IconFont type={'icon-designer-property-width'} />
      }
    })
  },
  height(props) {
    return getPropertyConfig('input', {
      label: '高度',
      title: '容器高度（height）：支持填写百分数和数字，填写数字时的单位为像素',
      prop: 'height',
      layout: 'half',
      ...props,
      props: {
        placeholder: '自适应',
        allowClear: true.valueOf(),
        ...props?.props
      },
      slots: {
        prefix: () => <IconFont type={'icon-designer-property-height'} />
      }
    })
  },
  color(props) {
    return getPropertyConfig('colorPicker', {
      label: '颜色',
      title: '颜色（color）',
      prop: 'color',
      ...props,
      props: {
        defaultValue: '#000000',
        ...props?.props
      }
    })
  },
  fontSize(props) {
    return getPropertyConfig('inputNumber', {
      label: '字号',
      title: '字体大小（font-size）',
      prop: 'fontSize',
      layout: 'half',
      ...props,
      props: {
        min: 12,
        max: 50,
        placeholder: '14px',
        ...props?.props
      }
    })
  },
  lineHeight(props) {
    return getPropertyConfig('input', {
      label: '行高',
      title: '行高（line-height）',
      prop: 'lineHeight',
      layout: 'half',
      ...props,
      props: {
        placeholder: '默认',
        allowClear: true,
        ...props?.props
      }
    })
  },
  gap(props) {
    return getPropertyConfig('input', {
      label: '组件间距',
      title: '各组件间的间隔距离（gap）',
      prop: 'gap',
      layout: 'half',
      ...props,
      props: {
        placeholder: '0px',
        allowClear: true,
        ...props?.props
      },
      slots: {
        prefix: () => <IconFont type={'icon-designer-property-flex-row-gap'} />
      }
    })
  },
  padding(props) {
    return getPropertyConfig('multiInput', {
      label: '内边距',
      title: '容器的内边距（padding）',
      prop: 'padding',
      props: {
        layout: 'half',
        placeholder: '0px',
        allowClear: true,
        ...props?.props
      },
      slots: {
        all: () => <IconFont type={'icon-designer-property-all'} />,
        tb: () => <IconFont type={'icon-designer-property-padding-tb'} />,
        lr: () => <IconFont type={'icon-designer-property-padding-lr'} />,
        top: () => <IconFont type={'icon-designer-property-padding-top'} />,
        bottom: () => <IconFont type={'icon-designer-property-padding-bottom'} />,
        left: () => <IconFont type={'icon-designer-property-padding-left'} />,
        right: () => <IconFont type={'icon-designer-property-padding-right'} />
      },
      ...props
    })
  },
  margin(props) {
    return getPropertyConfig('multiInput', {
      label: '外边距',
      title: '容器的外边距（margin）',
      prop: 'margin',
      ...props,
      props: {
        layout: 'half',
        placeholder: '0px',
        allowClear: true,
        ...props?.props
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
    })
  },
  overflow(props, propertyValues) {
    return getPropertyConfig('segmented', {
      label: '容器溢出',
      title: [
        <span>当内容溢出容器设置的宽高时的处理方式（overflow）</span>,
        <span>注意：此属性会受到容器的“宽度”、“高度”、“排列方向”、“多行显示”、“多列显示”等属性的影响</span>
      ],
      prop: 'overflow',
      ...props,
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
        ],
        ...props?.props
      }
    })
  },
  foreground() {
    return [
      getPropertyConfig('colorPicker', {
        label: '颜色',
        title: '文字正常状态下的颜色（color）',
        prop: 'color'
      }),
      getPropertyConfig('colorPicker', {
        label: '悬浮颜色',
        title: '文字鼠标悬浮状态下的颜色（color）',
        prop: 'hoverColor'
      }),
      getPropertyConfig('colorPicker', {
        label: '选中颜色',
        title: '文字选中状态下的颜色（color）',
        prop: 'selectedColor'
      })
    ]
  },
  upload(props) {
    if (!props?.prop) {
      throw new Error('propConfigForm配置错误：属性面板中使用上传功能时，prop为必传属性。')
    }

    return getPropertyConfig('image', {
      label: '图片',
      title: '图片地址（可以输入一个完整的图片地址或上传一张图片）',
      ...props,
      props: {
        placeholder: '请输入地址',
        ...props?.props
      },
      slots: {
        default: () => <IconFont type={'icon-designer-property-upload'} />
      }
    })
  },
  background(props, propertyValues) {
    const hasBackgroundImage = !!propertyValues?.style?.backgroundImage

    return [
      getPropertyConfig('colorPicker', {
        label: '底色',
        title: '容器的背景颜色（background-color）',
        prop: 'style.backgroundColor'
      }),
      getPropertyConfig('backgroundImage', {
        label: '图片/渐变色',
        title: '设置容器的背景图片或背景渐变色（background-image）。注意：此属性会处于背景底色的上层。',
        prop: 'style.backgroundImage',
        props: {
          placeholder: '透明'
        }
      }),
      getPropertyConfig('multiInput', {
        label: '图片尺寸',
        title: '容器背景图片的尺寸（background-size）',
        prop: 'style.backgroundSize',
        props: {
          disabled: !hasBackgroundImage,
          maxLength: 20,
          layout: 'half',
          placeholder: '自动',
          allowClear: true,
          defaultValue: '',
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
          disabled: !hasBackgroundImage,
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
          disabled: !hasBackgroundImage,
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
              title: '图像重复显示，自动缩放来消除间隙（round）'
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
  },
  justifyContent(props, propertyValues) {
    const isColumn = propertyValues?.style?.flexDirection === 'column'

    return getPropertyConfig('segmented', {
      label: '组件分布',
      title: '控制容器内组件在设定的排列方向上如何分布：靠拢或分散（justify-content）',
      prop: 'justifyContent',
      ...props,
      props: {
        options: [
          {
            label: () => <IconFont type={'icon-designer-property-jc-center'} class={{ column: isColumn }} />,
            value: 'center',
            title: '居中靠拢（center）'
          },
          {
            label: () => <IconFont type={'icon-designer-property-jc-start'} class={{ column: isColumn }} />,
            value: 'flex-start',
            title: `${isColumn ? '顶部' : '左侧'}靠拢（flex-start）`
          },
          {
            label: () => <IconFont type={'icon-designer-property-jc-end'} class={{ column: isColumn }} />,
            value: 'flex-end',
            title: `${isColumn ? '底部' : '右侧'}靠拢（flex-end）`
          },
          {
            label: () => <IconFont type={'icon-designer-property-jc-justify'} class={{ column: isColumn }} />,
            value: 'space-between',
            title: '两侧分散（space-between）'
          },
          {
            label: () => <IconFont type={'icon-designer-property-jc-sa'} class={{ column: isColumn }} />,
            value: 'space-around',
            title: '环绕分散（space-around）'
          },
          {
            label: () => <IconFont type={'icon-designer-property-jc-se'} class={{ column: isColumn }} />,
            value: 'space-evenly',
            title: '均匀分散（space-evenly）'
          }
        ],
        ...props?.props
      }
    })
  },
  alignItems(props, propertyValues) {
    const isColumn = propertyValues?.style?.flexDirection === 'column'

    return getPropertyConfig('segmented', {
      label: '组件对齐',
      title: '控制容器内各部件的对齐方式（align-items）',
      prop: 'alignItems',
      ...props,
      props: {
        options: [
          {
            label: () => <IconFont type={'icon-designer-property-ai-center'} class={{ column2: isColumn }} />,
            value: 'center',
            title: '居中对齐（center）'
          },
          {
            label: () => <IconFont type={'icon-designer-property-ai-start'} class={{ column2: isColumn }} />,
            value: 'flex-start',
            title: `${isColumn ? '左侧' : '顶部'}对齐（flex-start）`
          },
          {
            label: () => <IconFont type={'icon-designer-property-ai-end'} class={{ column2: isColumn }} />,
            value: 'flex-end',
            title: `${isColumn ? '右侧' : '底部'}对齐（flex-end）`
          },
          {
            label: () => <IconFont type={'icon-designer-property-ai-stretch'} class={{ column2: isColumn }} />,
            value: 'stretch',
            title: '拉伸对齐（stretch）'
          },
          {
            label: () => <IconFont type={'icon-designer-property-ai-baseline'} />,
            value: 'baseline',
            title: '基线对齐（baseline）'
          }
        ],
        ...props?.props
      }
    })
  },
  flexWrap(props, propertyValues) {
    return getPropertyConfig('select', {
      label: `多${propertyValues?.style?.flexDirection === 'column' ? '列' : '行'}显示`,
      title: `容器内组件的总宽度超过${
        propertyValues?.style?.flexDirection === 'column' ? '容器高度' : '容器宽度'
      }时${
        propertyValues?.style?.flexDirection === 'column' ? '另起一列' : '另起一行'
      }（flex-wrap）`,
      layout: 'half',
      prop: 'wrap',
      ...props,
      props: {
        options: [
          { label: '否', value: 'nowrap' },
          { label: '是', value: 'wrap' }
        ],
        ...props?.props
      }
    })
  }
}

const getComponent = (componentType) => {
  return {
    input: Input,
    inputNumber: InputNumber,
    checkbox: Checkbox,
    checkboxGroup: CheckboxGroup,
    radio: Radio,
    radioGroup: RadioGroup,
    select: Select,
    switch: Switch,
    colorPicker: ColorPicker,
    segmented: Segmented,
    multiInput: MultiInput,
    image: Image,
    multiSelect: MultiSelect,
    backgroundImage: BackgroundImage
  }[componentType]
}

/**
 * 获取属性配置的消费组件
 * @param componentType {string} - 组件类型标识
 * @param props {TGPropertyConfig} - 属性配置
 * @param [propertyValues] - 当前组件的所有可配属性及属性值
 * @returns {TGPropertyConfig}
 */
export default function getPropertyConfig(componentType, props, propertyValues) {
  return {
    label: props.label,
    title: props.title || undefined,
    prop: props.prop,
    props: props.props,
    layout: props.layout || 'full',
    slots: props.slots,
    modelProp: props.modelProp || 'value',
    componentType,
    component: markRaw(getComponent(componentType))
  }
}
