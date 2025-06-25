/**
 * @global
 * @typedef TGPropertyGroup
 * @property {string} label - 组件名称
 * @property {TGProperty[]} items - 组件属性配置
 */

/**
 * @global
 * @typedef TGProperty
 * @property {string} label - CSS属性名
 * @property {string} title - 鼠标移上显示的完整信息
 * @property {string} prop - 属性标识，指示当前属性控件应该对应组件元数据props中的哪个字段
 * @property {Object} [props={}] - 组件属性
 * @property {Object} [slots={}] - 插槽
 * @property {string} [layout] - 属性控件的布局，可选 'full','half'
 * @property {string} [modelProp] - 属性控件用于接收值的prop
 * @property {any} [component] - 操作属性的组件
 */

import { Input, InputNumber, Radio, RadioGroup, Segmented, Select, Switch } from 'ant-design-vue'
import TGColorPicker from '@/components/TGColorPicker'
import MultiInput from './components/MultiInput'

export function getOptionsOfPropertyField(prop, propertyValues) {
  if (prop === 'alignItems') {
    const isColumn = propertyValues?.style?.flexDirection === 'column'

    return [
      {
        label: () => <IconFont type={'icon-designer-property-ai-center'} class={{ column: isColumn }} />,
        value: 'center',
        title: '居中对齐（center）'
      },
      {
        label: () => <IconFont type={'icon-designer-property-ai-start'} class={{ column: isColumn }} />,
        value: 'flex-start',
        title: `${isColumn ? '左' : '上'}侧对齐（flex-start）`
      },
      {
        label: () => <IconFont type={'icon-designer-property-ai-end'} class={{ column: isColumn }} />,
        value: 'flex-end',
        title: `${isColumn ? '右' : '下'}侧对齐（flex-end）`
      },
      {
        label: () => <IconFont type={'icon-designer-property-ai-stretch'} class={{ column: isColumn }} />,
        value: 'stretch',
        title: '拉伸对齐（stretch）'
      },
      {
        label: () => <IconFont type={'icon-designer-property-ai-baseline'} />,
        value: 'baseline',
        title: '基线对齐（baseline）'
      }
    ]
  } else if (prop === 'justifyContent') {
    const isColumn = propertyValues?.style?.flexDirection === 'column'

    return [
      {
        label: () => <IconFont type={'icon-designer-property-jc-center'} class={{ column: isColumn }} />,
        value: 'center',
        title: '居中靠拢（center）'
      },
      {
        label: () => <IconFont type={'icon-designer-property-jc-start'} class={{ column: isColumn }} />,
        value: 'flex-start',
        title: `${isColumn ? '上' : '左'}侧靠拢（flex-start）`
      },
      {
        label: () => <IconFont type={'icon-designer-property-jc-end'} class={{ column: isColumn }} />,
        value: 'flex-end',
        title: `${isColumn ? '下' : '右'}侧靠拢（flex-end）`
      },
      {
        label: () => <IconFont type={'icon-designer-property-jc-justify'} class={{ column: isColumn }} />,
        value: 'space-between',
        title: `${isColumn ? '上下' : '左右'}两侧分散（space-between）`
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
    ]
  } else {
    return []
  }
}

/**
 * 获取属性配置的消费组件
 * @param componentType {string} - 组件类型标识
 * @param props {TGProperty} - 属性配置
 * @param [propertyValues] - 当前组件的所有可配属性及属性值
 * @returns {TGProperty}
 */
export default function getPropertyField(componentType, props, propertyValues) {
  const field = {
    label: props.label || '字符串',
    title: props.title || undefined,
    prop: props.prop,
    props: props.props,
    layout: props.layout || 'full',
    slots: props.slots,
    modelProp: props.modelProp || 'value',
    componentType,
    component: () => ({
      input: Input,
      inputNumber: InputNumber,
      radio: Radio,
      radioGroup: <RadioGroup size="small" optionType="button" />,
      select: <Select />,
      switch: <Switch />,
      colorPicker: TGColorPicker,
      segmented: Segmented,
      multiInput: MultiInput
    }[componentType])
  }

  if (!props.props?.options) {
    const options = getOptionsOfPropertyField(props.prop, propertyValues)

    if (options?.length) {
      if (!field.props) field.props = {}
      field.props.options = options
    }
  }

  return field
}
