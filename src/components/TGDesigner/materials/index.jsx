/**
 * 组件元数据定义
 * @global
 * @typedef TGComponentMeta
 * @property {string} [id] - 组件在 Schema 中的唯一标识
 * @property {string} type - 组件类型标识
 * @property {TG_MATERIAL_CATEGORY} category - 物料类型
 * @property {string} name - 组件名称
 * @property {function(Object): Element|JSX.Element} preview - 拖拽时的预览组件
 * @property {Object} [defaultProps] - 默认属性值。
 * 注意 defaultProps.style 为组件默认样式，不可通过属性面板修改，仅能被 TGComponentMeta.style 同名样式覆盖
 * @property {{[key in keyof CSSStyleDeclaration]?: string}} [style] - 组件样式。此对象内的样式可在属性面板中进行修改
 * @property {string} [class] - 组件样式表名称
 * @property {{ fields: TGPropertyField[] | TGPropertyFieldGroup[] }} configForm - 右侧属性面板配置
 */

/**
 * 物料类型枚举
 * @readonly
 * @enum {string}
 * @property {string} template - 模板组件
 * @property {string} base - 基础组件
 * @property {string} layout - 布局组件
 */
export const TG_MATERIAL_CATEGORY = {
  TEMPLATE: 'template',
  BASIC: 'basic',
  LAYOUT: 'layout'
}

/**
 * 物料预览类型枚举
 * @type {{PREVIEW: string, PORTAL: string}}
 */
export const TG_MATERIAL_PREVIEW_TYPE = {
  CANVAS: 'canvas',
  MATERIAL: 'material',
  MATERIAL_PREVIEW: 'materialPreview',
  PREVIEW: 'preview',
  PORTAL: 'portal'
}
