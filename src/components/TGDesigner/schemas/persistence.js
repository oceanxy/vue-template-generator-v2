export class SchemaService {
  static STORAGE_KEY = 'tg-schemas'

  static save(name, schema) {
    const schemas = JSON.parse(sessionStorage.getItem(this.STORAGE_KEY) || '{}')
    schemas[name] = schema
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(schemas))
  }

  static load(name) {
    const schemas = JSON.parse(sessionStorage.getItem(this.STORAGE_KEY) || '{}')
    return schemas[name] || null
  }

  static list() {
    return Object.keys(JSON.parse(sessionStorage.getItem(this.STORAGE_KEY) || '{}'))
  }
}
