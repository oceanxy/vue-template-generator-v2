/**
 * @global
 * @typedef TGPropertyField
 * @property {string} label - CSS属性名
 * @property {string} title - 鼠标移上显示的完整信息
 * @property {string} prop - 属性标识，指示当前属性控件应该对应组件元数据props中的哪个字段
 * @property {string} [modelProp] - 属性控件用于接收值的prop
 * @property {any} [component] - 操作属性的组件
 */

/**
 * @global
 * @typedef TGPropertyFieldParams
 * @property {string} [label='字符串'] - CSS属性名
 * @property {string} [title] - 鼠标移上显示的完整信息
 * @property {string} prop - 属性标识，指示当前属性控件应该对应组件元数据props中的哪个字段
 * @property {string} [modelProp='value'] - 属性控件用于接收值的prop
 * @property {Object} [props={}] - 组件属性
 */

import { Input, InputNumber, Radio, RadioGroup, Select, Switch } from 'ant-design-vue'
import TGColorPicker from '@/components/TGColorPicker'

export function getOptionsOfPropertyField(prop) {
  switch (prop) {
    case 'alignItems':
      return [
        {
          label: '填满容器（stretch）',
          value: 'stretch',
          title: 'stretch：如果（多个）元素的组合大小小于容器的大小，其中自动调整大小的元素将等量增大，\n' +
            '以填满容器，同时这些元素仍然保持其宽高比例的约束。'
        },
        {
          label: '居中（center）',
          value: 'center',
          title: 'center：flex 元素的外边距框在交叉轴上居中对齐。\n' +
            '如果元素的交叉轴尺寸大于 flex 容器，它将在两个方向上等距溢出。'
        },
        {
          label: '容器基线（baseline）',
          value: 'baseline',
          title: 'baseline：所有 flex 元素都对齐，以使它们的 flex 容器基线 对齐。\n' +
            '距离其交叉轴起点和基线之间最远的元素与行的交叉轴起点对齐。'
        },
        {
          label: '起点（flex-start）',
          value: 'flex-start',
          title: 'flex-start：将元素与 flex 容器的主轴起点或交叉轴起点对齐。'
        },
        {
          label: '末端（flex-end）',
          value: 'flex-end',
          title: 'flex-end：将元素与 flex 容器的主轴末端或交叉轴末端对齐。'
        }
      ]
    case 'justifyContent':
      return [
        {
          label: '顶部对齐（flex-start）',
          value: 'flex-start',
          title: 'flex-start：元素紧密地排列在弹性容器的主轴起始侧。'
        },
        {
          label: '底部对齐（flex-end）',
          value: 'flex-end',
          title: 'flex-end：元素紧密地排列在弹性容器的主轴结束侧。'
        },
        {
          label: '居中（center）',
          value: 'center',
          title: 'center：伸缩元素向每行中点排列。\n' +
            '每行第一个元素到行首的距离将与每行最后一个元素到行尾的距离相同。'
        },
        {
          label: '均分（space-between）',
          value: 'space-between',
          title: 'space-between：在每行上均匀分配弹性元素。相邻元素间距离相同。\n' +
            '每行第一个元素与行首对齐，每行最后一个元素与行尾对齐。'
        },
        {
          label: '均分并居中（space-around）',
          value: 'space-around',
          title: 'space-around：在每行上均匀分配弹性元素。相邻元素间距离相同。\n' +
            '每行第一个元素到行首的距离和每行最后一个元素到行尾的距离将会是相邻元素之间距离的一半。'
        },
        {
          label: '两端对齐（space-evenly）',
          value: 'space-evenly',
          title: 'space-evenly：flex 项都沿着主轴均匀分布在指定的对齐容器中。相邻 flex 项之间的间距，\n' +
            '主轴起始位置到第一个 flex 项的间距，主轴结束位置到最后一个 flex 项的间距，都完全一样。'
        }
      ]
    default:
      return []
  }
}

/**
 * 获取属性配置的消费组件
 * @param componentType {string} - 组件类型标识
 * @param props {TGPropertyFieldParams} - 属性配置
 * @returns {TGPropertyField}
 */
export default function getPropertyField(componentType, props) {
  return {
    label: props.label || '字符串',
    title: props.title || undefined,
    prop: props.prop,
    props: {
      ...props.props,
      options: props.props?.options || getOptionsOfPropertyField(props.prop)
    },
    modelProp: props.modelProp || 'value',
    component: () => ({
      input: Input,
      inputNumber: InputNumber,
      radio: Radio,
      radioGroup: RadioGroup,
      select: Select,
      switch: Switch,
      colorPicker: TGColorPicker
    }[componentType])
  }
}
