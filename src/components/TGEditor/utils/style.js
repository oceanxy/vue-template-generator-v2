const UNIT_PROPS = [
  'width', 'height', 'top', 'left', 'right', 'bottom',
  'margin', 'marginTop', 'marginLeft', 'marginRight', 'marginBottom',
  'padding', 'paddingTop', 'paddingLeft', 'paddingRight', 'paddingBottom',
  'fontSize', 'borderRadius'
]

export function styleWithUnits(styleObj) {
  return Object.entries(styleObj).reduce((acc, [key, value]) => {
    if (typeof value === 'number' && UNIT_PROPS.includes(key)) {
      acc[key] = `${value}px`
    } else {
      acc[key] = value
    }
    return acc
  }, {})
}
