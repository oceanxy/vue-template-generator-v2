/**
 * 表单
 * @Author: Omsber
 * @Email: xyzsyx@163.com
 * @Date: 2024-10-18 周五 15:44:52
 */

import useStore from '@/composables/tgStore'
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { Form } from 'ant-design-vue'

/**
 * @param {string} location
 * @param {SearchParamOption[]} [searchParamOptions] - 搜索参数配置。
 * @param {()=>boolean} [buttonDisabledFn] - 禁用查询和重置按钮的方法。
 * @param {Object} [rules={}] - 验证规则，参考 ant-design-vue 的 Form.Item。
 * @param {((state: Object) => Object) | Object} [paramsForGetList={}] - 搜索接口的额外参数，默认为空对象。
 * 注意：
 * - 搜索接口的默认参数为 store.state.search 对象内所有字段，本字段配置的参数会在调用接口前合并到接口参数中，但不会改变 store.state.search 的值。
 * - 如果与 store.state.search 有同名字段，本配置返回的字段的优先级更高。
 * @returns {Object}
 */
export default function useTGForm({
  location,
  searchParamOptions,
  buttonDisabledFn,
  rules = {},
  paramsForGetList = {}
} = {}) {
  const store = useStore()
  const commonStore = useStore('./common')

  const loading = computed(() => store[location].loading)
  const search = computed(() => store[location].search)

  const formModel = reactive(search.value)
  const formRules = reactive(rules)

  // 按钮禁用状态
  const buttonDisabled = ref(false)

  if (typeof buttonDisabledFn === 'function') {
    watch(formModel, () => buttonDisabled.value = buttonDisabledFn())
  }

  const {
    resetFields,
    clearValidate,
    validate,
    validateInfos
  } = Form.useForm(formModel, formRules)

  async function onClear() {
    resetFields()
    onFinish()
  }

  function onFinish(callback) {
    validate()
      .then(async () => {
        store[location].confirmLoading = true
        await callback?.()
        store[location].confirmLoading = false
      })
      .catch(e => {/***/})
  }

  /**
   * 枚举执行函数
   * @param enumOptions
   * @returns {(function(): Promise<(function(): void)|(function(): *)>)|*}
   */
  function execEnum(enumOptions) {
    return async () => {
      const { listener, ...options } = enumOptions

      if (listener) {
        await store.getList(options)

        // 返回函数：监听 store.state.search[paramNameInSearchRO]，以更新 store.state.dataSource
        return () => {
          watch(
            () => search.value[enumOptions.paramNameInSearchRO],
            (newVal, oldValue) => {
              if (
                // 必填时值变化，或者非必填时值有变化
                (enumOptions.isRequired && newVal && newVal !== oldValue) ||
                (!enumOptions.isRequired && newVal !== oldValue)
              ) {
                store.onSearch()
              }
            }
          )
        }
      }

      return store.getList(options)
    }
  }

  onMounted(async () => {
    if (searchParamOptions?.length) {
      await Promise.all(searchParamOptions.map(enumOptions => execEnum(enumOptions)))
    }
  })

  onUnmounted(() => {
    store.$reset()
  })

  return {
    validateInfos,
    resetFields,
    clearValidate,
    onFinish,
    formModel,
    store,
    commonStore,
    buttonDisabled,
    loading,
    onClear
  }
}
