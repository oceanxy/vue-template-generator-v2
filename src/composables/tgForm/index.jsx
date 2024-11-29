/**
 * 表单
 * @Author: Omsber
 * @Email: xyzsyx@163.com
 * @Date: 2024-10-18 周五 15:44:52
 */

import './assets/styles/index.scss'
import useStore from '@/composables/tgStore'
import { computed, inject, onUnmounted, reactive, ref, watch, watchEffect } from 'vue'
import { Form } from 'ant-design-vue'

/**
 * @param {string} location
 * @param {SearchParamOption[]} [searchParamOptions] - 搜索参数配置。
 * @param {()=>boolean} [buttonDisabledFn] - 禁用查询和重置按钮的方法。
 * @param {Object} [rules={}] - 验证规则，参考 ant-design-vue 的 Form.Item。
 * @param [modalStatusFieldName] {string} - 弹窗状态字段名。
 * @param [loaded] {(Object)=>void} - 所有 searchParamOptions 指定的接口全部加载完成时的回调。
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
  modalStatusFieldName,
  loaded,
  paramsForGetList = {}
} = {}) {
  const hasTree = inject('hasTree', false)
  const refreshTree = inject('refreshTree')

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
   * @param [params] {(() => Object) | Object} - 接口参数，受`isMergeParam`影响。
   * @param [isMergeParam] {boolean} - 是否将 params 参数与默认值合并，默认为 false。
   * 注意合并后不会改变 store 内对应的字段，仅传递给接口使用；不合并时会使用 params 参数覆盖默认值。
   * @param [refreshTable=true] {boolean} - 是否刷新表格数据，默认 true。
   * @param [isRefreshTree] {boolean} - 是否在成功提交表单后刷新对应的侧边树，默认 false。
   * 依赖`inject(hasTree)`和`inject(refreshTree)`。
   * @param [modalStatusFieldName='showModalForEditing'] {string} - 弹窗状态字段名，
   * 用于操作完成后关闭指定弹窗，默认值为'showModalForEditing'。
   * @param [success] {()=>void} - 操作执行成功后的回调函数。
   */
  function handleFinish({
    action,
    params,
    isMergeParam,
    callback,
    refreshTable = true,
    isRefreshTree,
    modalStatusFieldName = 'showModalForEditing',
    success
  } = {}) {
    validate()
      .then(async () => {
          if (typeof callback === 'function') {
            await callback?.()
          } else {
            params = typeof params === 'function' ? params() : params
            const res = await store.fetch({
              action,
              location,
              params,
              isMergeParam,
              refreshTable,
              modalStatusFieldName
            })

            if (res.status) {
              // 执行侧边树刷新操作
              if (isRefreshTree && hasTree) {
                await refreshTree?.()
              }

              success?.()
            }
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
  async function execEnum(enumOptions) {
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

  onUnmounted(() => {
    store.$reset()
  })

  const TGForm = {
    name: 'TGForm',
    setup(props, { slots, emit }) {
      const inModal = inject('inModal', false)
      const open = computed(() => store[modalStatusFieldName])

      if (inModal) {
        watchEffect(async () => {
          if (open.value && searchParamOptions?.length) {
            await Promise.all(searchParamOptions.map(enumOptions => execEnum(enumOptions)))

            // 接口加载完毕
            loaded(form)
          }
        })
      }

      return () => (
        <Form class={'tg-form'} colon={false}>
          {slots.default?.()}
        </Form>
      )
    }
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
