import { getCurrentInstance, inject } from 'vue'
import { firstLetterToLowercase as toLowercase } from '@/utils/utilityFunction'
import router from '@/router'

const appName = process.env.TG_APP_NAME
const storeCache = new Map()

/**
 * 获取 store
 * @param {string|null} [storeName] - store名称，对应页面组件名称。
 * - '/storeName' 代表框架级公共 store，为 'src/stores/modules' 路径下的模块；
 * - './storeName' 代表项目级公共 store，为 'src/apps/.../stores' 路径下的模块；
 * - 'storeName' 代表项目级页面 store，为 'src/apps/.../stores/modules' 路径下的模块。
 * @returns {*}
 */
export default function useStore(storeName) {
  let storeNameToUse = storeName
  let pageStore = null

  const instance = getCurrentInstance()

  if (instance) {
    // 仅在 Vue 上下文中才调用 inject
    // 优先使用传递给方法的 storeName，否则使用注入的 storeName（在模块或页面入口处注入，比如TGContainer组件）
    storeNameToUse = storeNameToUse || inject('storeName', null)
    pageStore = inject('pageStore', null)
  }

  if (!storeNameToUse && pageStore) {
    return pageStore
  }

  // 生成缓存键
  const cacheKey = storeNameToUse || 'default_route_store'

  // 检查缓存
  if (storeCache.has(cacheKey)) {
    return storeCache.get(cacheKey)
  }

  let store

  if (!storeNameToUse) {
    storeNameToUse = router.currentRoute.value.name

    // 如果第二个字母是大写，说明store名称的开始是由几个单词首字母缩写而成的，此时的store名称保持大写
    if (/[a-z]/.test(storeNameToUse.charAt(1))) {
      storeNameToUse = toLowercase(router.currentRoute.value.name)
    }

    // 使用缓存键检查
    const routeCacheKey = `route_${storeNameToUse}`
    if (storeCache.has(routeCacheKey)) {
      return storeCache.get(routeCacheKey)
    }

    store = require(`@/apps/${appName}/stores/modules/${storeNameToUse}`)
    const storeInstance = store.default()
    storeCache.set(routeCacheKey, storeInstance)
    return storeInstance
  } else {
    const _storeName = storeNameToUse.split('/').at(-1)
    let pathKey

    if (storeNameToUse.startsWith('./')) {
      pathKey = `./${toLowercase(_storeName)}`
    } else if (storeNameToUse.startsWith('/')) {
      pathKey = `/${toLowercase(_storeName)}`
    } else {
      pathKey = `default/${toLowercase(_storeName)}`
    }

    // 检查路径缓存
    if (storeCache.has(pathKey)) {
      return storeCache.get(pathKey)
    }

    if (storeNameToUse.startsWith('./')) {
      store = require(`@/apps/${appName}/stores/${toLowercase(_storeName)}`)
    } else if (storeNameToUse.startsWith('/')) {
      store = require(`@/stores/modules/${toLowercase(_storeName)}`)
    } else {
      store = require(`@/apps/${appName}/stores/modules/${toLowercase(_storeName)}`)
    }

    const storeInstance = store.default()
    storeCache.set(pathKey, storeInstance)
    return storeInstance
  }
}

useStore.clearCache = () => {
  storeCache.clear()
}
