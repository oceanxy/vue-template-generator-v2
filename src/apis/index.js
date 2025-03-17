import getService from '@/utils/request'
import configs from '@/configs'
import router from '@/router'
import { getApisFromFiles } from '@/utils/store'

// 加载框架内的apis
const modulesFiles = require.context('./modules', true, /\.js$/)
// 加载app内的apis
const dynamicModulesFiles = require.context('../apps', true, /apis\/[a-zA-Z0-9-]+\.js/)

const commonApis = getApisFromFiles(modulesFiles)
const appApis = getApisFromFiles(dynamicModulesFiles)
export const apiConfigs = { ...commonApis, ...appApis }

/**
 * 注入axios后的api函数对象
 * @type {{[p: string]: (data?: Object, params?: Object) => Promise}}
 */
const apis = {}

const request = getService(configs, router)

// 动态注入参数
Object.entries(apiConfigs).forEach(([apiName, api]) => {
  apis[apiName] = (data, params) => {
    if (
      Object.prototype.toString.call(data) === '[object Object]' && !Object.keys(data).length &&
      Object.prototype.toString.call(params) === '[object Object]' && Object.keys(params).length
    ) {
      [data, params] = [params, undefined]
    }

    const requestConfig = api(data, params)

    if (configs.mock && requestConfig.mockUrl) {
      requestConfig.url = requestConfig.mockUrl
      delete requestConfig.mockUrl
    }

    return request(requestConfig)
  }
})

export default apis
