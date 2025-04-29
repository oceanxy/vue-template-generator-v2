import { nextTick, onMounted, ref } from 'vue'
import { theme } from 'ant-design-vue'

export default function useThemeVars() {
  const { useToken, defaultAlgorithm, defaultSeed } = theme
  const { token } = useToken()
  const staticToken = ref(defaultAlgorithm(defaultSeed))
  const cssVars = ref({})

  /**
   * Converts an RGB color value to HSL. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes r, g, and b are contained in the set [0, 255] and
   * returns h, s, and l in the set [0, 1].
   *
   * @param {number} r - The red color value
   * @param {number} g - The green color value
   * @param {number} b - The blue color value
   * @return {Array} - The HSL representation
   */
  function rgbToHsl(r, g, b) {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h
    let s
    const l = (max + min) / 2

    if (max === min) {
      h = s = 0 // achromatic
    } else {
      const d = max - min

      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return [h, s, l]
  }

  /**
   * Converts an HUE color value to RGB.
   * @param p {number}
   * @param q {number}
   * @param t {number}
   * @returns {*}
   */
  function hueToRgb(p, q, t) {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  /**
   * Converts an HSL color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes h, s, and l are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   *
   * @param {number} h - The hue
   * @param {number} s - The saturation
   * @param {number} l - The lightness
   * @return {Array} - The RGB representation
   */
  function hslToRgb(h, s, l) {
    let r
    let g
    let b

    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hueToRgb(p, q, h + 1 / 3)
      g = hueToRgb(p, q, h)
      b = hueToRgb(p, q, h - 1 / 3)
    }

    return [r * 255, g * 255, b * 255]
  }

  /**
   * 调整16进制颜色的透明度
   * @param hex {string}
   * @param [alpha=1] {number} - 取值范围 [0,1]
   * @returns {string} rgba颜色
   */
  function hexToRgba(hex, alpha = 1) {
    // 去掉#号
    hex = hex.replace('#', '')

    // 处理3位和6位的十六进制颜色
    let r,
      g,
      b
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16)
      g = parseInt(hex[1] + hex[1], 16)
      b = parseInt(hex[2] + hex[2], 16)
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16)
      g = parseInt(hex.substring(2, 4), 16)
      b = parseInt(hex.substring(4, 6), 16)
    } else {
      throw new Error('Invalid hex color format')
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  /**
   * 调整十六进制颜色的明暗度
   * @param {string} hex - 十六进制颜色（支持3/4/6/8位格式）
   * @param {number} percent - 调整百分比（-100 到 100）
   * @returns {string} 调整后的十六进制颜色
   */
  function adjustHexBrightness(hex, percent) {
    // 移除#号并统一为6位格式
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }

    // 解析RGB分量
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    // 转换为HSL空间
    const [h, s, l] = rgbToHsl(r, g, b);

    // 调整亮度（限制在0-1范围内）
    const newLightness = Math.min(Math.max(l + (l * percent / 100), 0), 1);

    // 转换回RGB
    const [newR, newG, newB] = hslToRgb(h, s, newLightness);

    // 返回十六进制格式
    return '#' + [newR, newG, newB]
      .map(v => Math.round(v).toString(16).padStart(2, '0'))
      .join('');
  }

  async function updateCssVars(mode) {
    await nextTick()
    staticToken.value = defaultAlgorithm(defaultSeed)
    cssVars.value = {
      '--tg-theme-motion-ease-in-out': staticToken.value.motionEaseInOut,
      '--tg-theme-line-height': token.value.lineHeight,
      '--tg-theme-color-white': token.value.colorWhite,
      '--tg-theme-color-primary': token.value.colorPrimary,
      '--tg-theme-color-primary-hover': token.value.colorPrimaryHover,
      '--tg-theme-color-primary-active': token.value.colorPrimaryActive,
      '--tg-theme-color-primary-bg': token.value.colorPrimaryBg,
      '--tg-theme-color-primary-bg-hover': token.value.colorPrimaryBgHover,
      '--tg-theme-color-primary-text': token.value.colorPrimaryText,
      '--tg-theme-color-primary-text-active': token.value.colorPrimaryTextActive,
      '--tg-theme-color-primary-text-hover': token.value.colorPrimaryTextHover,
      '--tg-theme-color-primary-border': token.value.colorPrimaryBorder,
      '--tg-theme-color-primary-border-hover': token.value.colorPrimaryBorderHover,
      '--tg-theme-color-error': token.value.colorError,
      '--tg-theme-color-error-bg': token.value.colorErrorBg,
      '--tg-theme-color-border': token.value.colorBorder,
      '--tg-theme-color-border-reset': mode !== 'darkAlgorithm' ? token.value.colorBorderSecondary : '#303030',
      '--tg-theme-color-header-text': mode !== 'darkAlgorithm' ? '#c2c2c2' : '#7f7f7f',
      '--tg-theme-color-border-hover': token.value.colorPrimaryBorderHover,
      '--tg-theme-color-border-secondary': token.value.colorBorderSecondary,
      '--tg-theme-color-error-border': token.value.colorErrorBorder,
      '--tg-theme-color-error-border-hover': token.value.colorErrorBorderHover,
      '--tg-theme-color-error-shadow': hexToRgba(token.value.colorErrorBorder, 0.5),
      '--tg-theme-color-icon': token.value.colorIcon,
      '--tg-theme-color-icon-hover': token.value.colorIconHover,
      '--tg-theme-color-text': token.value.colorText,
      '--tg-theme-color-text-secondary': token.value.colorTextSecondary,
      '--tg-theme-color-text-tertiary': token.value.colorTextTertiary,
      '--tg-theme-color-text-quaternary': token.value.colorTextQuaternary,
      '--tg-theme-color-bg-container': token.value.colorBgContainer,
      '--tg-theme-color-bg-elevated': token.value.colorBgElevated,
      '--tg-theme-color-bg-layout': token.value.colorBgLayout,
      '--tg-theme-color-fill-quaternary': token.value.colorFillQuaternary,
      '--tg-theme-color-fill-secondary': token.value.colorFillSecondary,
      '--tg-theme-color-fill-tertiary': token.value.colorFillTertiary,
      '--tg-theme-color-split': token.value.colorSplit,
      '--tg-theme-font-size': token.value.fontSize + 'px',
      '--tg-theme-font-size-sm': token.value.fontSizeSM + 'px',
      '--tg-theme-font-size-lg': token.value.fontSizeLG + 'px',
      '--tg-theme-font-size-xl': token.value.fontSizeXL + 'px',
      '--tg-theme-font-size-icon': token.value.fontSizeIcon + 'px',
      '--tg-theme-border-radius': token.value.borderRadius + 'px',
      '--tg-theme-control-item-bg-active': token.value.controlItemBgActive,
      '--tg-theme-control-item-bg-hover': token.value.controlItemBgHover,
      '--tg-theme-margin-sm': token.value.marginSM + 'px',
      '--tg-theme-margin': token.value.margin + 'px',
      '--tg-theme-margin-md': token.value.marginMD + 'px',
      '--tg-theme-margin-lg': token.value.marginLG + 'px'
    }
  }

  onMounted(async () => {
    await updateCssVars()
  })

  return {
    /**
     * 响应式主题
     */
    token,
    /**
     * 静态主题
     */
    staticToken,
    /**
     * 用于CSS变量
     */
    cssVars,
    adjustHexBrightness,
    updateCssVars,
    hexToRgba
  }
}
