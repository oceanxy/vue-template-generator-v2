export class SchemaConverter {
  static toSchema(components) {
    return components.map(comp => ({
      id: comp.id,
      type: comp.type,
      props: comp.currentProps,
      style: comp.computedStyle
    }))
  }

  static toDOM(schema) {
    return schema.components.map(comp => ({
      id: comp.id,
      type: comp.type,
      props: { ...comp.props, key: comp.id }
    }))
  }
}
