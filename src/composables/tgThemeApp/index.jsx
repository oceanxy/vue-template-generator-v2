import useStore from '@/composables/tgStore'
import themeFiles from '@/assets/styles/themes'
import useThemeVars from '@/composables/themeVars'
import { computed, onBeforeMount, onMounted, onUnmounted, ref, Suspense, watch } from 'vue'
import { App, ConfigProvider, Empty, StyleProvider, theme } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { getFirstLetterOfEachWordOfAppName } from '@/utils/utilityFunction'
import { RouterView } from 'vue-router'
import TGGlobalSpinner from '@/components/TGGlobalSpinner'
import { app } from '@/main'
import GlobalComponents from '@app/plugins/globalComponents'
import configs from '@/configs'
import { logger } from '@/utils/logger'

/**
 * 仅供 App 组件使用的主题配置，其他地方请使用 useThemeVars
 * @returns {{theme: *}}
 */
export default function useThemeApp() {
  const appName = getFirstLetterOfEachWordOfAppName()
  const commonStore = useStore('/common')
  const loginStore = useStore('/login')
  const { cssVars, updateCssVars } = useThemeVars()
  const localTheme = localStorage.getItem(`${appName}-theme`)
  const customTheme = ref(themeFiles[localTheme || commonStore.themeName])
  const store = useStore('/login')
  const verifyStatus = computed(() => store.verifyStatus)
  const message = computed(() => loginStore.loadingMessage)

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

  onBeforeMount(() => {
    configs?.systemName && logger('欢迎使用', configs.systemName)
    configs?.version && logger('当前版本', configs.version)

    handleVersionChange()
    // 注册插件
    app.use(GlobalComponents)
  })

  onMounted(() => window.addEventListener('resize', handleResize))
  onUnmounted(() => window.removeEventListener('resize', handleResize))

  const handleVersionChange = () => {
    const localVersion = localStorage.getItem(`${appName}-version`)

    if (configs?.version && localVersion !== configs.version) {
      useStore('/login').clear()
      localStorage.setItem(`${appName}-version`, configs.version)
    }
  }
  // 监听屏幕尺寸变化
  const handleResize = () => {
    commonStore.updateScreenInfo()
  }

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
            <Suspense>
              {{
                default: () => (<>{
                  verifyStatus.value === 'pending'
                    ? <TGGlobalSpinner message={message.value.title} content={message.value.content} />
                    : <RouterView />
                }</>),
                fallback: () => <TGGlobalSpinner message={message.value.title} content={message.value.content} />
              }}
            </Suspense>
            <div id="tg-global-modals" />
          </App>
        </StyleProvider>
      </ConfigProvider>
    )
  }

  return { ThemeApp, app }
}
