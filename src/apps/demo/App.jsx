import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import useThemeApp from '@/composables/tgThemeApp'
import 'ant-design-vue/dist/reset.css'
import '@/assets/styles/app.scss'

dayjs.locale('zh-cn')

export default {
  setup() {
    const { ThemeApp } = useThemeApp()

    return () => <ThemeApp />
  }
}
