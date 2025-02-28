import customThemes from '@/assets/styles/themes'
import useStore from '@/composables/tgStore'

/**
 * 仅供 App 组件使用的主题配置，其他地方请使用 useThemeVars
 * @returns {{theme: *}}
 */
export default function useAppTheme() {
  const commonStore = useStore('/common')
  const theme = customThemes[commonStore.themeName]

  return {
    /**
     * 主题配置（提供给 ant-design-vue 的初始化数据）
     */
    theme
  }
}
