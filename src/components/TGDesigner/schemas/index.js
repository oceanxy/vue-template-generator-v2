/**
 * @typedef {Object} TGSchema
 * @property {string} version - 版本号
 * @property {TGCanvas} canvas - 画布配置
 * @property {TGComponentSchema[]} components - 组件集合
 */

/**
 * @typedef {Object} TGComponentSchema
 * @property {string} id - 组件唯一标识符
 * @property {string} [parentId] - 父级组件ID，目前只有布局组件中的子组件需要用到
 * @property {string} [cellPosition] - 布局容器相对于当前GridLayout组件的位置信息
 * @property {string} type - 组件类型
 * @property {TG_MATERIAL_CATEGORY} category - 物料类型
 * @property {Object} props - 组件props
 * @property {TGComponentSchema[]} [children] - 子组件集合（仅布局组件需要）
 */

import { predefinedProperties } from '../properties'
import { markRaw } from 'vue'

/**
 * 默认schema
 * @type {TGSchema}
 */
export const schema = {
  version: '1.0',
  components: [],
  canvas: {
    class: '',
    style: {
      width: '100%',
      height: '',
      padding: 15,
      margin: 0,
      gap: 8,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      backgroundColor: '',
      backgroundImage: '',
      backgroundSize: '',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
}

/**
 * canvas属性配置表单
 * @type {(propertyValues: Object) => (TGPropertyConfig|TGPropertyConfigGroup)[]}
 */
export const canvasPropConfigForm = propertyValues => markRaw([
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
      predefinedProperties.gap(),
      predefinedProperties.padding(),
      predefinedProperties.margin(),
      predefinedProperties.justifyContent(
        {
          label: '垂直分布方式',
          title: '控制画布内各部件在垂直方向上如何分布：靠拢或分散（justify-content）'
        },
        { style: { flexDirection: 'column' } }
      ),
      predefinedProperties.alignItems(
        {
          label: '水平对齐方式',
          title: '控制画布内各部件在水平方向上的对齐方式（align-items）'
        },
        { style: { flexDirection: 'column' } }
      )
    ]
  },
  {
    label: '背景',
    items: predefinedProperties.background(null, propertyValues)
  }
])
