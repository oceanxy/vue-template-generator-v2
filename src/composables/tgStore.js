import { firstLetterToLowercase as toLowercase } from '@/utils/utilityFunction'
import router from '@/router'

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
    let name = router.currentRoute.value.name

    // 如果第二个字母是大写，说明store名称的开始是由几个单词首字母缩写而成的，此时的store名称保持大写
    if (/[a-z]/.test(name.charAt(1))) {
      name = toLowercase(router.currentRoute.value.name)
    }

    store = require(`@/apps/${appName}/stores/modules/${name}`)
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
