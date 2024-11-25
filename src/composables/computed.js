import { computed } from 'vue'
import { getValueFromStringKey, setValueToStringKey } from '@/utils/utilityFunction'

/**
 * 为 store.state 内字段快速生成带有 setter 和 getter 的计算属性
 * @param {string} stateName - store.state.search 内的字段名。
 * 支持 '.' 嵌套，例如 'search.id'
 * @param {import('pinia').StoreDefinition} [store] - store 名称
 * @returns {import('vue').WritableComputedRef<*, *>|*|undefined}
 */
export function useComputedWithGS(stateName, store) {
  return computed({
    get() {
      return getValueFromStringKey(stateName, store) ?? undefined
    },
    set(value) {
      setValueToStringKey(stateName, value, store)
    }
  })
}
