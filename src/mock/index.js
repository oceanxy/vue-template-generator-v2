import Mock from 'mockjs'
import APP_CONFIG from '@/configs'
import { getEnvVar } from '@/utils/env'
import { getApisFromFiles } from '@/utils/store'

Mock.setup({ timeout: APP_CONFIG.mockDelay })
const { mock } = Mock

const modulesFiles = require.context('./modules', true, /\.js/)
const appModuleFiles = require.context('../apps', true, /mock\/[a-zA-Z0-9-]+\.js/)
const mockModule = getApisFromFiles(modulesFiles)
const mockAppModule = getApisFromFiles(appModuleFiles)

// 注册需要被 mock js 拦截的接口
export default Object.entries({ ...mockModule, ...mockAppModule }).map(([modelKey, mockModel]) => {
  // 把接口地址中的"/"替换为转义字符“\/”
  const url = `${getEnvVar('TG_APP_BASE_API')}${modelKey}`.replaceAll(/\/+/g, '\\/')

  mock(new RegExp(`${url}(|\\?\\S*)$`), options => {
    const printOptions = { ...options }

    if (printOptions.body) {
      if (printOptions.body.includes('&')) {
        // 处理表单格式数据
        try {
          printOptions.body = Object.fromEntries(new URLSearchParams(printOptions.body))
        } catch (e) {
          console.warn('Query parse error:', e)
          printOptions.body = {}
        }
      } else {
        // 处理JSON格式数据
        try {
          printOptions.body = JSON.parse(printOptions.body)
        } catch (e) {
          console.warn('JSON parse error:', e)
          printOptions.body = null // 或根据业务需求设置默认值
        }
      }
    } else {
      printOptions.body = {} // 处理空body情况
    }

    let response

    if (typeof mockModel === 'function') {
      response = mock(mockModel(printOptions))
    } else {
      response = mock(mockModel)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[mock request] ', printOptions)
      console.log('[mock response] ', response)
    }

    return response
  })
})
