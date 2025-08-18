/**
 * 提供对存储在sessionStorage中的模式(schema)进行操作的静态服务类
 * 使用sessionStorage存储模式数据，键名为'tg-designer-schema'
 * 存储结构为：{ [schema名称]: schema对象 }
 */
export class SchemaService {
  /** @private 存储在sessionStorage中的键名 */
  static STORAGE_KEY = 'tg-designer-schema'

  /**
   * 将指定名称的模式保存到sessionStorage中
   * @static
   * @param {string} name - 要保存的模式名称
   * @param {Object} schema - 要保存的模式对象
   * @example
   * SchemaService.save('formSchema', { fields: [...] });
   */
  static save(name, schema) {
    const schemas = JSON.parse(sessionStorage.getItem(this.STORAGE_KEY) || '{}')
    schemas[name] = schema
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(schemas))
  }

  /**
   * 从sessionStorage中加载指定名称的模式
   * @static
   * @param {string} name - 要加载的模式名称
   * @returns {Object|null} 对应的模式对象，如果不存在则返回null
   * @example
   * const schema = SchemaService.load('formSchema');
   */
  static load(name) {
    const schemas = JSON.parse(sessionStorage.getItem(this.STORAGE_KEY) || '{}')
    return schemas[name] || null
  }

  /**
   * 获取sessionStorage中存储的所有模式名称列表
   * @static
   * @returns {string[]} 所有存储的模式名称数组
   * @example
   * const schemaNames = SchemaService.list();
   */
  static list() {
    const schemas = JSON.parse(sessionStorage.getItem(this.STORAGE_KEY) || '{}')
    return Object.keys(schemas)
  }
}
