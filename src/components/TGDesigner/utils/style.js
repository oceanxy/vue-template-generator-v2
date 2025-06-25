const UNIT_PROPS = [
  'width', 'height', 'minHeight', 'minWidth', 'top', 'left', 'right', 'bottom',
  'margin', 'marginTop', 'marginLeft', 'marginRight', 'marginBottom',
  'padding', 'paddingTop', 'paddingLeft', 'paddingRight', 'paddingBottom',
  'fontSize', 'borderRadius', 'gap', 'columnGap', 'rowGap'
]

export function styleWithUnits(styleObj) {
  return Object.entries(styleObj).reduce((acc, [key, value]) => {
    if ((typeof value === 'number' || !isNaN(value === '' ? 'unset' : value)) && UNIT_PROPS.includes(key)) {
      acc[key] = `${value}px`
    } else if (['padding', 'margin'].includes(key) && (typeof value === 'string' && value.includes(' '))) {
      acc[key] = value.split(' ').map(v => {
        if (!isNaN(v === '' ? 'unset' : v)) {
          return `${v}px`
        }

        return v
      }).join(' ')
    } else {
      acc[key] = value
    }

    return acc
  }, {})
}

/**
 * 解析样式值（支持px和%单位）
 * @param {string|number} value
 * @param {number} defaultValue
 * @returns {number}
 */
export function parseStyleValue(value, defaultValue = 0) {
  if (typeof value === 'number') return value
  if (!value) return defaultValue
  const match = value.match(/^([\d.]+)(px|%)$/)
  return match ? parseFloat(match[1]) : defaultValue
}
