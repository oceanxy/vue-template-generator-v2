import axios from 'axios'
import { showMessage } from '@/utils/message'
import { getFirstLetterOfEachWordOfAppName } from '@/utils/utilityFunction'
import configs from '@/configs'
import { getEnvVar } from '@/utils/env'
import useStore from '@/composables/tgStore'

const appName = getFirstLetterOfEachWordOfAppName()

export default function getService(conf, router) {
  const service = axios.create({
    baseURL: getEnvVar('TG_APP_BASE_API'),
    timeout: conf.timeout
  })

  // request interceptor
  service.interceptors.request.use(
    async config => {
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

      // if (INTERFACE_MAPPINGS) {
      //   config.data = INTERFACE_MAPPINGS?.request(config.data, qs)
      // }

      return config
    },
    async error => {
      showMessage({
        message: error.message,
        type: 'error'
      })

      return Promise.resolve({
        code: 0,
        status: false
      })
    }
  )

  // response interceptor
  service.interceptors.response.use(
    async response => {
      let res = response.data

      // if (response.config.responseType !== 'blob' && INTERFACE_MAPPINGS) {
      //   res = INTERFACE_MAPPINGS.response(response.data)
      // }

      if (res?.status || response.config.responseType === 'blob') {
        if (res instanceof Blob && res.type === 'application/json') {
          const fileReader = new FileReader()

          fileReader.onloadend = async () => {
            const res = JSON.parse(fileReader.result)
            res.type = 'application/json'

            return await cb(res)
          }

          fileReader.readAsText(res)
        } else {
          res.type = 'application/json'
          return Promise.resolve(res)
        }
      } else {
        return await cb(res)
      }

      async function cb(res) {
        if (!('status' in res)) {
          if (res.code !== 200) {
            showMessage({
              message: '第三方接口调用失败！',
              type: 'error'
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
            type: 'error'
          })
        }

        // 未登录或登录失效，需要重新登录
        if (+res.code === 30001) {
          if (localStorage.getItem(`${appName}-${configs.tokenConfig.fieldName}`)) {
            await useStore('/login').clear()
          }

          await router.replace({ name: 'Login' })
        } else if (/*无权限*/+res.code === 40006) {
          await router.replace({ name: 'NoAccess' })
        }

        return Promise.resolve({
          code: 0,
          status: false,
          data: res.data,
          message: res.message
        })
      }
    },
    async error => {
      showMessage({
        message: error.message,
        type: 'error'
      })

      return Promise.resolve({
        code: 0,
        status: false,
        message: error.message
      })
    }
  )

  return service
}
