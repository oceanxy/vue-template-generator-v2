/**
 * @typedef {Object} TGSchema
 * @property {string} version - 版本号
 * @property {TGCanvas} canvas - 画布配置
 * @property {TGComponentSchema[]} components - 组件集合
 */

/**
 * @typedef {Object} TGComponentSchema
 * @property {string} id - 组件唯一标识符
 * @property {string} type - 组件类型
 * @property {TG_MATERIAL_CATEGORY} category - 物料类型
 * @property {Object} props - 组件props
 * @property {TGComponentSchema[]} [children] - 子组件集合（仅布局组件需要）
 */

/**
 * 默认schema
 * @type {TGSchema}
 */
export const schema = {
  version: '1.0',
  canvas: {
    class: '',
    style: {
      width: 1200,
      backgroundColor: '#ffffff',
      padding: 15
    }
  },
  components: []
}
