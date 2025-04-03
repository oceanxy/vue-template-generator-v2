/**
 * 物料类型枚举
 * @readonly
 * @enum {string}
 * @property {string} template - 模板组件
 * @property {string} base - 基础组件
 * @property {string} layout - 布局组件
 */
export const TG_COMPONENT_CATEGORY = {
  TEMPLATE: 'template',
  BASIC: 'basic',
  LAYOUT: 'layout'
}

/**
 * @global
 * @typedef TGPropertyField
 * @property {string} type - 属性类型标识
 * @property {string} label - CSS属性名
 * @property {string} title - 鼠标移上显示的完整信息
 * @property {string} prop - 属性标识，指示当前属性控件应该对应组件元数据props中的哪个字段
 * @property {any} [component] - 操作属性的组件
 */

/**
 * 模板组件元数据定义
 * @global
 * @typedef TGComponentMeta
 * @property {string} [id] - 组件在 Schema 中的唯一标识
 * @property {string} type - 模板组件类型标识
 * @property {TG_COMPONENT_CATEGORY} category - 物料类型
 * @property {string} [icon] - 模板组件图标
 * @property {function(Object): Element|JSX.Element} preview - 拖拽时的预览组件
 * @property {Object} [defaultProps] - 默认属性值
 * @property {{[key in keyof CSSStyleDeclaration]?: string}} [style] - 组件样式
 * @property {string} [class] - 组件样式表名称
 * @property {{ fields: TGPropertyField[] }} configForm - 右侧属性面板配置
 */
