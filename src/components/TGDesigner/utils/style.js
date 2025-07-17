const UNIT_PROPS = [
  'width', 'height', 'minHeight', 'minWidth', 'top', 'left', 'right', 'bottom',
  'margin', 'marginTop', 'marginLeft', 'marginRight', 'marginBottom',
  'padding', 'paddingTop', 'paddingLeft', 'paddingRight', 'paddingBottom',
  'fontSize', 'borderRadius', 'gap', 'columnGap', 'rowGap', 'backgroundSize'
]

export function styleWithUnits(styleObj) {
  return Object.entries(styleObj).reduce((acc, [key, value]) => {
    if ((typeof value === 'number' || !isNaN(value === '' ? 'unset' : value)) && UNIT_PROPS.includes(key)) {
      acc[key] = `${value}px`
    } else if (
      ['padding', 'margin', 'backgroundSize'].includes(key) &&
      (typeof value === 'string' && value.includes(' '))
    ) {
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

/**
 * 从样式对象中获取 marginLeft 和 marginRight 的值
 * @param {Object} styleObj - 样式对象，可能包含以下形式：
 *   1. { marginLeft: '10px', marginRight: '20px' }
 *   2. { margin: '15px' }
 *   3. { margin: '5px 10px' } 或 { margin: '5px 10px 15px 20px' }
 * @returns {Object} 包含 marginLeft 和 marginRight 的对象
 */
export function getMarginValues(styleObj) {
  // 初始化默认值
  let marginLeft = '0px'
  let marginRight = '0px'

  // 情况1: 直接获取 marginLeft/marginRight
  if (styleObj.marginLeft || styleObj.marginRight) {
    marginLeft = styleObj.marginLeft || '0px'
    marginRight = styleObj.marginRight || '0px'
  }
  // 情况2 & 3: 解析 margin 简写属性
  else if (styleObj.margin) {
    const margins = styleObj.margin.split(/\s+/)

    switch (margins.length) {
      // 单值: 所有边距相同
      case 1:
        marginLeft = margins[0]
        marginRight = margins[0]
        break

      // 双值: 上下 | 左右
      case 2:
        marginLeft = margins[1]
        marginRight = margins[1]
        break

      // 三值: 上 | 左右 | 下
      case 3:
        marginLeft = margins[1]
        marginRight = margins[1]
        break

      // 四值: 上 | 右 | 下 | 左
      case 4:
        marginLeft = margins[3]
        marginRight = margins[1]
        break
    }
  }

  return { marginLeft, marginRight }
}

/**
 * 从样式对象中获取 padding 的值
 * @param {Object} styleObj - 样式对象，可能包含以下形式：
 *   1. { paddingLeft: '10px', paddingRight: '20px' }
 *   2. { padding: '15px' }
 *   3. { padding: '5px 10px' } 或 { padding: '5px 10px 15px 20px' }
 * @returns {{
 *   paddingTop: string,
 *   paddingRight: string,
 *   paddingBottom: string,
 *   paddingLeft: string
 * }} 包含 paddingTop, paddingRight, paddingBottom, paddingLeft 的对象
 */
export function getPaddingValues(styleObj) {
  // 初始化默认值
  let paddingLeft = '0px'
  let paddingRight = '0px'
  let paddingTop = '0px'
  let paddingBottom = '0px'

  // 情况1: 直接获取 marginLeft/marginRight
  if (styleObj.paddingLeft || styleObj.paddingRight || styleObj.paddingTop || styleObj.paddingBottom) {
    paddingLeft = styleObj.paddingLeft || '0px'
    paddingRight = styleObj.paddingRight || '0px'
    paddingTop = styleObj.paddingTop || '0px'
    paddingBottom = styleObj.paddingBottom || '0px'
  }
  // 情况2 & 3: 解析 padding 简写属性
  else if (styleObj.padding) {
    const paddings = styleObj.padding.split(/\s+/)

    switch (paddings.length) {
      // 单值: 所有边距相同
      case 1:
        paddingLeft = paddings[0]
        paddingRight = paddings[0]
        paddingTop = paddings[0]
        paddingBottom = paddings[0]
        break

      // 双值: 上下 | 左右
      case 2:
        paddingLeft = paddings[1]
        paddingRight = paddings[1]
        paddingTop = paddings[0]
        paddingBottom = paddings[0]
        break

      // 三值: 上 | 左右 | 下
      case 3:
        paddingTop = paddings[0]
        paddingLeft = paddings[1]
        paddingRight = paddings[1]
        paddingBottom = paddings[2]
        break

      // 四值: 上 | 右 | 下 | 左
      case 4:
        paddingTop = paddings[0]
        paddingRight = paddings[1]
        paddingBottom = paddings[2]
        paddingLeft = paddings[3]
        break
    }
  }

  return { paddingTop, paddingRight, paddingBottom, paddingLeft }
}

/**
 * 处理样`backgroundImage`属性，未包裹`url()`时自动包裹
 * @param value
 * @returns {*|string}
 */
export function formatBackgroundImage(value) {
  if (value) {
    const bgImage = value.trim()

    // 处理图片路径（非url格式）
    if (!/gradient\(/i.test(bgImage) && !/^url\(/i.test(bgImage)) {
      return `url(${bgImage})`
    }

    return bgImage
  }

  return value
}
