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
      backgroundColor: '#ffffff',
      backgroundImage: '',
      backgroundSize: '',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
}
