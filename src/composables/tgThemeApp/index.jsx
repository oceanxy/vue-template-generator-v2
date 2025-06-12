import useStore from '@/composables/tgStore'
import themeFiles from '@/assets/styles/themes'
import useThemeVars from '@/composables/themeVars'
import { computed, ref, watch } from 'vue'
import { App, ConfigProvider, Empty, StyleProvider, theme } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { getFirstLetterOfEachWordOfAppName } from '@/utils/utilityFunction'
import { useRoute } from 'vue-router'
import { range } from 'lodash'

/**
 * 仅供 App 组件使用的主题配置，其他地方请使用 useThemeVars
 * @returns {{theme: *}}
 */
export default function useThemeApp() {
  const appName = getFirstLetterOfEachWordOfAppName()
  const commonStore = useStore('/common')
  const { cssVars, updateCssVars } = useThemeVars()
  const localTheme = localStorage.getItem(`${appName}-theme`)
  const customTheme = ref(themeFiles[localTheme || commonStore.themeName])
  const store = useStore('/login')
  const isTokenValid = computed(() => store.isTokenValid)
  const route = useRoute()

  // 影响布局和主题的变量变动后，更新CSS变量
  watch(
    () => [
      commonStore.algorithm,
      commonStore.themeName,
      commonStore.fontSize,
      commonStore.componentSize,
      commonStore.isCompactAlgorithm
    ],
    async (val) => {
      customTheme.value = themeFiles[val[1]]
      await updateCssVars(val[0])
    }
  )

  const themeForConfigProvider = computed(() => {
    const algorithm = [theme[commonStore.algorithm || customTheme.value.algorithm]]

    if (commonStore.isCompactAlgorithm) {
      algorithm.push(theme.compactAlgorithm)
    }

    return {
      algorithm,
      token: {
        ...customTheme.value.token,
        fontSize: commonStore.fontSize || theme.token.fontSize
      }
    }
  })

  function ThemeApp(props, { slots }) {
    return (
      <ConfigProvider
        locale={zhCN}
        renderEmpty={() => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
        wave={{ disabled: false }}
        theme={themeForConfigProvider.value}
        componentSize={commonStore.componentSize}
      >
        <StyleProvider hash-priority="high">
          <App
            style={cssVars.value}
            data-doc-theme={commonStore.algorithm === 'darkAlgorithm' ? 'dark' : 'light'}
          >
            {
              !isTokenValid.value && route.meta.requiresAuth !== false
                ? (
                  <div id="loading">
                    <div>{range(5).map(() => <span></span>)}</div>
                  </div>
                )
                : slots.default()
            }
          </App>
        </StyleProvider>
      </ConfigProvider>
    )
  }

  return { ThemeApp }
}
