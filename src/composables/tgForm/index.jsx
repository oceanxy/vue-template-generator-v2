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
  const search = computed(() => store.search)
  const form = computed(() => store[location]?.form)

  const formModel = reactive(form.value)
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

  async function handleClear() {
    resetFields()
    handleFinish()
  }

  /**
   * 提交表单
   * @param [callback] {()=>void} - 自定义验证成功后执行的回调函数，该参数优先于 action 参数。
   * @param [action] {string} - 提交表单的类型，可选值：'add'、'update' 或 'export'，
   * 默认根据`store.state.currentItem`中的`id`字段自动判断是 'update' 还是 'add'，其他情况则需要自行传递。
   * @param [paramFormater] {()=>Object} - 自定义接口参数格式化函数。
   * @param [refreshTable=true] {boolean} - 是否刷新表格数据，默认 true。
   * @param [modalStatusFieldName='showModalForEditing'] {string} - 弹窗状态字段名，
   * 用于操作完成后关闭指定弹窗，默认值为'showModalForEditing'。
   */
  function handleFinish({
    action,
    paramFormater,
    callback,
    refreshTable = true,
    modalStatusFieldName = 'showModalForEditing'
  } = {}) {
    validate()
      .then(async () => {
          if (typeof callback === 'function') {
            await callback?.()
          } else {
            await store.fetch({
              action,
              location,
              params: paramFormater?.(),
              refreshTable,
              modalStatusFieldName
            })
          }
        }
      )
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
            () => form.value[enumOptions.paramNameInSearchRO],
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

  function TGForm(props, { slots }) {
    return (
      <Form class={'tg-form-modal'} colon={false}>
        {slots.default?.()}
      </Form>
    )
  }

  return {
    search,
    validateInfos,
    resetFields,
    clearValidate,
    handleFinish,
    formModel,
    store,
    commonStore,
    buttonDisabled,
    loading,
    handleClear,
    TGForm
  }
}
