/**
 * @typedef {Object} TGSchema
 * @property {string} version - 版本号
 * @property {TGCanvas} canvas - 画布配置
 * @property {TGComponentMeta[]} components - 组件集合
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
