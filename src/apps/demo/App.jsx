import 'ant-design-vue/dist/reset.css'
import '@/assets/styles/app.scss'
import { RouterView } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import useThemeApp from '@/composables/tgThemeApp'
import globalComponents from '@app/plugins/globalComponents'
import { onBeforeMount } from 'vue'
import { app } from '@/main'

dayjs.locale('zh-cn')

export default {
  setup() {
    onBeforeMount(() => {
      app.use(globalComponents)
    })

    const { ThemeApp } = useThemeApp()

    return () => (
      <ThemeApp>
        <RouterView />
        {/* 定义弹窗的容器，可根据项目需求自行定义到其他地方 */}
        <div id="tg-global-modals"></div>
      </ThemeApp>
    )
  }
}
