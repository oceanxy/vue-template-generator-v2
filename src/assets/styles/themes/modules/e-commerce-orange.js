import { theme } from 'ant-design-vue'

const colorPrimary = '#fe7325'

export default {
  name: '电商橙',
  token: {
    // 字号
    fontSize: 14,
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
