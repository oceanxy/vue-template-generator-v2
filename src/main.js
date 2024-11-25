import { createApp } from 'vue'
import pinia from '@/stores'
import router from '@/router'
import antDesignConfig from '@/configs/antDesignConfig'

const app = createApp(__TG_APP_COMPONENT__.default)

app.use(router)
app.use(pinia)
app.mount('#root')

antDesignConfig(app)

app.config.errorHandler = err => {
  /* 处理错误 */
  console.error(err)
}

export { app }
