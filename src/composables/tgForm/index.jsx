/**
 * 表单
 * @Author: Omsber
 * @Email: xyzsyx@163.com
 * @Date: 2024-10-18 周五 15:44:52
 */

import './assets/styles/index.scss'
import useStore from '@/composables/tgStore'
import { computed, inject, onUnmounted, reactive, ref, watch } from 'vue'
import { Button, Form } from 'ant-design-vue'

/**
 * @param [showButton] {boolean} - 是否确认按钮。
 * @param [okButtonProps={}] {import('ant-design-vue.Button.props')} - okButton 按钮的属性。
 * @param [okButtonParams={}] {{}} - ok按钮点击时的参数（handleFinish函数的参数）。
 * @param location {string}
 * @param [searchParamOptions] {SearchParamOption[]} - 搜索参数配置。
 * @param [isGetDetails] {boolean} - 是否请求该弹窗的详情数据。
 * @param [setDetails] {(data: any, store: import('pinia').defineStore) => void} - 获取到详细
 * 数据后的自定义数据处理逻辑，不为函数时默认与`store.state.currentItem`合并。
 * @param [buttonDisabledFn] {()=>boolean} - 禁用查询和重置按钮的方法。
 * @param [rules={}] {Object} - 验证规则，参考 ant-design-vue 的 Form.Item。
 * @param [modalStatusFieldName] {string} - 弹窗状态字段名。
 * @param [loaded] {(Object)=>void} - 所有 searchParamOptions 指定的接口全部加载完成时的回调。
 * @returns {Object}
 */
export default function useTGForm({
  showButton = false,
  okButtonProps = {},
  okButtonParams = {},
  location,
  searchParamOptions,
  isGetDetails,
  setDetails,
  buttonDisabledFn,
  rules = {},
  modalStatusFieldName,
  loaded
} = {}) {
  const hasTree = inject('hasTree', false)
  const refreshTree = inject('refreshTree', undefined)

  const store = useStore()
  const commonStore = useStore('./common')

  const loading = computed(() => store[location].loading)
  const search = computed(() => store.search)
  const form = computed(() => store[location]?.form)
  const currentItem = computed(() => store.currentItem)

  const formModel = reactive(location ? form.value : search.value)
  const formRules = reactive(rules)

  // 按钮禁用状态
  const buttonDisabled = ref(false)
  const confirmLoading = ref(false)

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
   * @param [callback] {()=>void} - 自定义验证成功后执行的回调函数，该参数与本函数的其他所有参数互斥。
   * @param [apiName] {string} - 自定义接口名称，传递此值时，action将失效。
   * @param [action] {'update','add',string} - 操作类型，未定义 apiName 时生效。
   * 默认根据`store.state.currentItem`中的`id`字段自动判断是 'update' 还是 'add'，其他情况则需要自行传递。
   * 主要用于生成接口地址，生成规则`{ACTION}{router.currentRoute.value.name}`。
   * @param [params] {(() => Object) | Object} - 接口参数，受`isMergeParam`影响。
   * @param [isMergeParam] {boolean} - 是否将 params 参数与默认值合并，默认为 false。
   * 注意合并后不会改变 store 内对应的字段，仅传递给接口使用；不合并时会使用 params 参数覆盖默认值。
   * @param [isRefreshTable=true] {boolean} - 是否刷新表格数据，默认 true。
   * @param [isRefreshTree] {boolean} - 是否在成功提交表单后刷新对应的侧边树，默认 false。
   * 依赖`inject(hasTree)`和`inject(refreshTree)`。
   * @param [success] {(res: Object)=>void} - 操作执行成功后的回调函数，参数为接口的 Response。
   */
  function handleFinish({
    callback,
    apiName,
    action,
    params,
    isMergeParam,
    isRefreshTable = true,
    isRefreshTree,
    success
  } = {}) {
    validate()
      .then(async () => {
          confirmLoading.value = true

          if (typeof callback === 'function') {
            await callback?.()
          } else {
            params = typeof params === 'function' ? params() : params

            const res = await store.fetch({
              action,
              apiName,
              location,
              params,
              isMergeParam,
              isRefreshTable,
              modalStatusFieldName
            })

            if (res.status) {
              // 执行侧边树刷新操作
              if (isRefreshTree && hasTree) {
                await refreshTree?.()
              }

              success?.(res)
            }
          }

          confirmLoading.value = false
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
    const { listener, condition, dependentField, ...options } = enumOptions
    const isContinue = typeof condition === 'function'
      ? condition()
      : condition

    if (typeof isContinue !== 'boolean' || isContinue) {
      // 处理依赖参数的初始化
      if (dependentField) {
        await new Promise(resolve => {
          watch(
            () => options.location ? form.value[dependentField] : search.value[dependentField],
            async (newVal, oldValue) => {
              if (newVal !== oldValue) {
                resolve(await store.getList(options))
              }
            }
          )
        })
      } else {
        await store.getList(options)
      }

      if (listener) {
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
                store.execSearchAndGetList()
              }
            }
          )
        }
      }
    }
  }

  onUnmounted(() => {
    store.$reset()
  })

  const TGForm = {
    name: 'TGForm',
    setup(props, { slots, emit }) {
      const inModal = inject('inModal', false)
      const isInit = inject('isInit', false)

      const { text, loading, ...restOkButtonProps } = okButtonProps

      if (inModal) {
        const open = computed(() => store[modalStatusFieldName])

        watch(open, async val => {
          if (val) {
            if (searchParamOptions?.length) {
              await Promise.all([
                getDetails(),
                ...searchParamOptions.map(enumOptions => execEnum(enumOptions))
              ])
            } else {
              await getDetails()
            }

            // 接口加载完毕后对表单的处理逻辑
            typeof loaded === 'function' && loaded(form)
          }
        }, { immediate: true })
      }

      async function getDetails() {
        if (isGetDetails && currentItem.value.id) {
          return await store.getDetails({
            location,
            setValue: setDetails
          })
        }

        return Promise.resolve()
      }

      return () => (
        <Form class={'tg-form'} colon={false}>
          {slots.default?.()}
          {
            showButton && (
              <Button
                {...restOkButtonProps}
                loading={loading || confirmLoading.value}
                onClick={() => handleFinish({
                  ...okButtonParams,
                  isRefreshTable: isInit
                })}
              >
                {text}
              </Button>
            )
          }
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
    confirmLoading,
    handleClear,
    TGForm
  }
}
