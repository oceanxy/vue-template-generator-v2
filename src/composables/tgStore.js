import { firstLetterToLowercase as toLowercase } from '@/utils/utilityFunction'
import useModuleName from '@/composables/moduleName'

const appName = process.env.TG_APP_NAME

/**
 * 获取 store
 * @param {string} [storeName] - store名称，对应页面组件名称。
 * - '/storeName' 代表框架级公共 store，为 'src/stores/modules' 路径下的模块；
 * - './storeName' 代表项目级公共 store，为 'src/apps/.../stores' 路径下的模块；
 * - 'storeName' 代表项目级页面 store，为 'src/apps/.../stores/modules' 路径下的模块。
 * @returns {*}
 */
export default function useStore(storeName) {
  let store

  if (!storeName) {
    const moduleName = useModuleName()
    store = require(`@/apps/${appName}/stores/modules/${toLowercase(moduleName.value)}`)
  } else {
    const _storeName = storeName.split('/').at(-1)

    if (storeName.startsWith('./')) {
      store = require(`@/apps/${appName}/stores/${toLowercase(_storeName)}`)
    } else if (storeName.startsWith('/')) {
      store = require(`@/stores/modules/${toLowercase(_storeName)}`)
    } else {
      store = require(`@/apps/${appName}/stores/modules/${toLowercase(_storeName)}`)
    }
  }

  return store.default()
}
