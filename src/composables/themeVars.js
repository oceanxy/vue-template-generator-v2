import { onMounted, ref } from 'vue'
import { theme } from 'ant-design-vue'

export default function useThemeVars() {
  const { useToken, defaultAlgorithm, defaultSeed } = theme
  const { token } = useToken()
  const staticToken = defaultAlgorithm(defaultSeed)
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
   * Converts an HSL color value to RGB.
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
   * RGB颜色亮度调整
   * @param rgbCode {string} - RGB颜色
   * @param percent {number} - 百分数
   * @returns {string}
   */
  function increaseBrightness(rgbCode, percent) {
    const r = parseInt(rgbCode.slice(1, 3), 16)
    const g = parseInt(rgbCode.slice(3, 5), 16)
    const b = parseInt(rgbCode.slice(5, 7), 16)
    const HSL = rgbToHsl(r, g, b)
    const newBrightness = HSL[2] + HSL[2] * (percent / 100)
    let RGB

    RGB = hslToRgb(HSL[0], HSL[1], newBrightness)

    rgbCode = '#'
      + convertToTwoDigitHexCodeFromDecimal(RGB[0])
      + convertToTwoDigitHexCodeFromDecimal(RGB[1])
      + convertToTwoDigitHexCodeFromDecimal(RGB[2])

    return rgbCode
  }

  function convertToTwoDigitHexCodeFromDecimal(decimal) {
    let code = Math.round(decimal).toString(16);

    (code.length > 1) || (code = '0' + code)

    return code
  }

  onMounted(() => {
    cssVars.value = {
      '--tg-theme-motion-ease-in-out': staticToken.motionEaseInOut,
      '--tg-theme-color-primary': token.value.colorPrimary,
      '--tg-theme-color-primary-hover': token.value.colorPrimaryHover,
      '--tg-theme-color-primary-active': token.value.colorPrimaryActive,
      '--tg-theme-color-primary-bg': token.value.colorPrimaryBg,
      '--tg-theme-color-primary-bg-hover': token.value.colorPrimaryBgHover,
      '--tg-theme-color-primary-border': token.value.colorPrimaryBorder,
      '--tg-theme-color-primary-border-hover': token.value.colorPrimaryBorderHover,
      '--tg-theme-color-border': token.value.colorBorder,
      '--tg-theme-color-border-hover': token.value.colorPrimaryBorderHover,
      '--tg-theme-color-border-secondary': token.value.colorBorderSecondary,
      '--tg-theme-color-text': token.value.colorText,
      '--tg-theme-color-text-secondary': token.value.colorTextSecondary,
      '--tg-theme-color-text-tertiary': token.value.colorTextTertiary,
      '--tg-theme-color-text-quaternary': token.value.colorTextQuaternary,
      '--tg-theme-font-size': token.value.fontSize + 'px',
      '--tg-theme-font-size-lg': token.value.fontSizeLG + 'px',
      '--tg-theme-border-radius': token.value.borderRadius + 'px',
      '--tg-theme-control-item-bg-hover': token.value.controlItemBgHover
    }
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
    increaseBrightness
  }
}
