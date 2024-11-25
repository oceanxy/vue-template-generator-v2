import { theme } from 'ant-design-vue'

const colorPrimary = '#16b364'

export const customTheme = {
  header: {
    colorPrimaryBg: colorPrimary,
    colorPrimary: '#ffffff',
    colorBgAvatar: '#36bf76',
    colorTextSecondary: '#82d9a5'
  }
}

export default {
  name: '健康绿',
  token: {
    // 主题色
    colorPrimary,
    motionBase: 0,
    motionEaseInBack: 'unset',
    motionEaseInOut: '',
    motionEaseInOutCirc: '',
    motionEaseInQuint: '',
    motionEaseOut: '',
    motionEaseOutBack: '',
    motionEaseOutCirc: '',
    motionEaseOutQuint: '',
    motionUnit: 0.1
  },
  // 默认算法 theme.defaultAlgorithm 暗色算法 darkAlgorithm  紧凑算法 compactAlgorithm
  algorithm: theme.defaultAlgorithm
}
