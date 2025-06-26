import axios from 'axios'
import { showMessage } from '@/utils/message'
import { getFirstLetterOfEachWordOfAppName } from '@/utils/utilityFunction'
import configs from '@/configs'
import { getEnvVar } from '@/utils/env'
import useStore from '@/composables/tgStore'
import { getAbortController } from '@/router'
import qs from 'qs'

const appName = getFirstLetterOfEachWordOfAppName()

export default function getService(conf, router) {
  const service = axios.create({
    baseURL: getEnvVar('TG_APP_BASE_API'),
    timeout: conf.timeout
  })

  // request interceptor
  service.interceptors.request.use(
    async config => {
      // 处理接口取消参数
      config.signal = getAbortController().signal

      // 处理后台令牌
      const highPriorityToken = config.params?.token
      const token = localStorage.getItem(`${appName}-${conf.tokenConfig.fieldName}`)

      if (highPriorityToken) {
        config.headers.token = highPriorityToken
      } else if (token) {
        config.headers.token = token

        if (conf.tokenConfig?.isInUrl) {
          config.params = {
            ...config.params,
            token
          }
        }
      }

      if (conf.header?.params?.show) {
        if (conf.header.params.fieldName) {
          config.headers[conf.header.params.fieldName] = localStorage.getItem(`${appName}-headerId`)
        } else {
          throw new Error('未在 src/config/index.js 中配置 header.params.fieldName 字段。')
        }
      }

      if (__TG_APP_INTERFACE_MAPPINGS__) {
        config.data = __TG_APP_INTERFACE_MAPPINGS__?.request(config.data, qs)
      }

      return config
    },
    async error => {
      if (!axios.isCancel(error)) {
        showMessage({
          message: error.message,
          type: 'error',
          code: 0
        })
      }

      return Promise.resolve({
        code: error.code || 0,
        status: false,
        message: error.message
      })
    }
  )

  // response interceptor
  service.interceptors.response.use(
    async response => {
      let res = response.data

      if (response.config.responseType !== 'blob' && __TG_APP_INTERFACE_MAPPINGS__) {
        res = __TG_APP_INTERFACE_MAPPINGS__.response(response.data)
      }

      if (response.config.responseType === 'blob') {
        if (res instanceof Blob && res.type === 'application/json') {
          const fileReader = new FileReader()

          fileReader.onloadend = async () => {
            const res = JSON.parse(fileReader.result)

            return await cb(res)
          }

          fileReader.readAsText(res)
        } else {
          return Promise.resolve(res)
        }
      } else if (res?.status) {
        return Promise.resolve(res)
      } else {
        return await cb(res)
      }

      async function cb(res) {
        if (!('status' in res)) {
          if (res.code !== 200) {
            showMessage({
              message: '第三方接口调用失败！',
              type: 'error',
              code: res.code
            })
          } else {
            return Promise.resolve({
              code: 10000,
              status: true,
              data: res.data
            })
          }
        } else {
          showMessage({
            message: res.message,
            type: 'error',
            code: res.code
          })
        }

        // 未登录或登录失效，需要重新登录
        if (+res.code === 30001) {
          if (localStorage.getItem(`${appName}-${configs.tokenConfig.fieldName}`)) {
            await useStore('/login').clear()
          }

          showMessage({
            message: '登录失效，请重新登录!',
            type: 'error',
          })

          setTimeout(async () => {
            await router.replace({ name: 'Login' })
          }, 1500)

        } else if (/*无权限*/+res.code === 40006) {
          await router.replace({ name: 'NoAccess' })
        }

        return Promise.resolve({
          code: res.code || 0,
          status: false,
          data: res.data,
          message: res.message
        })
      }
    },
    async error => {
      if (!axios.isCancel(error)) {
        showMessage({
          message: error.message,
          type: 'error',
          code: 0
        })
      }

      return Promise.resolve({
        code: error.code || 0,
        status: false,
        message: error.message
      })
    }
  )

  return service
}
