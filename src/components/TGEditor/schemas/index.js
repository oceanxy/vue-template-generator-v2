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
    width: 1200,
    backgroundColor: '#ffffff',
    style: {
      gap: '8px',
      padding: '20px'
    }
  },
  components: []
}
