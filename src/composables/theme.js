import { useCommonStore } from '@/stores/modules/common'
import { storeToRefs } from 'pinia'
import customThemes from '@/assets/styles/themes'
import { provide } from 'vue'

/**
 * 共 App 组件使用的主题配置
 * @returns {{customTheme: *, theme: Omit<*, "customTheme">}}
 */
export default function useAppTheme() {
  const commonStore = useCommonStore()
  const { themeName } = storeToRefs(commonStore)
  const { customTheme, ...theme } = customThemes[themeName.value]

  provide('customTheme', customTheme)

  return {
    /**
     * 自定义主题
     */
    customTheme,
    /**
     * 主题配置（提供给 ant-design-vue 的初始化数据）
     */
    theme
  }
}
