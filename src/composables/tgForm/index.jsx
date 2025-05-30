import './assets/styles/index.scss'
import useStore from '@/composables/tgStore'
import { computed, inject, nextTick, onUnmounted, reactive, ref, toRaw, watch } from 'vue'
import { Button, Form } from 'ant-design-vue'
import { useRoute } from 'vue-router'

/**
 * TGForm 组件
 * @param [storeName] {string} - store名称，store名称，默认为当前页面的store模块。
 * @param [isSearchForm] {boolean} - 是否是作为搜索表单使用，默认false：作为数据表单使用。
 * @param [showSubmitButton] {boolean} - 是否显示表单的提交按钮。
 * @param [submitButtonProps={}] {import('ant-design-vue').ButtonProps} - `submitButton`按钮的属性，依赖`showSubmitButton`参数。
 * @param [submitButtonProps.submitOptions] {Object} - `submitButton`按钮的内置提交事件（handleFinish函数）的参数。
 * 如果传递了`submitButtonProps.onClick`，则不会调用内置的提交事件，且此参数无效。
 * @param [submitButtonProps.onClick] {Button.props.onClick} - `submitButton`按钮的提交事件，默认值为本组件内置的
 * `handleFinish`提交函数。如果显示地传入该值，则不再调用本组件的内置提交函数，而是调用此参数指定的函数。
 * @param [location] {string} - store内弹窗数据的存储位置。
 * @param [modalStatusFieldName] {string} - 弹窗状态字段名。
 * @param [searchParamOptions] {SearchParamOption[]} - 搜索参数配置。
 * @param [isGetDetails] {boolean} - 是否请求该弹窗内数据表单的详情数据（注意区分数据表单与搜索表单）。
 * @param [apiName] {string} - 自定义获取详情的接口名称，依赖`isGetDetails`，默认为`getDetailsOf{route.name}`。
 * @param [getParams] {((currentItem:Object) => Object) | Object} - 自定义获取详情的参数，默认为`store.state.currentItem.id`。
 * @param [setDetails] {(data: any, store: import('pinia').defineStore) => void} - 获取到详细
 * 数据后的自定义数据处理逻辑，不为函数时默认与`store.state.currentItem`合并。
 * @param [formModelFormatter] {(currentItem: Object, isNewModal?: boolean) => Object} - 初始化表单数据函数。
 * - 参数为`currentItem`，返回值为处理后的表单数据，只需返回需要处理的字段即可。比如将接口中获取的省、市、区三个字段处理成
 * 一个数组，以供 Cascader 组件绑定使用。
 * - 参数`isNewModal`，值为 true 表示当前弹窗是新增弹窗，值为 false 表示当前弹窗是编辑弹窗。
 * @param [buttonDisabledFn] {() => boolean} - 禁用查询和重置按钮的方法。
 * @param [rules={}] {Object} - 验证规则，参考 ant-design-vue 的 Form.Item。
 * @param [loaded] {(Object) => void} - 所有 searchParamOptions 指定的接口和获取详情接口（如果有）全部加载完成后的回调。
 * @returns {Object}
 */
export default function useTGForm({
  storeName,
  isSearchForm = false,
  showSubmitButton = false,
  submitButtonProps = {},
  location,
  modalStatusFieldName,
  searchParamOptions,
  isGetDetails,
  apiName,
  getParams,
  setDetails,
  formModelFormatter,
  buttonDisabledFn,
  rules = {},
  loaded
} = {}) {
  const unWatch = ref([])
  const formRef = ref(null)
  // 表单的数据源`formModel`（通常指`store[location].form`对象的值）是否从`currentItem`中初始化完成。
  // 外部组件如果需要对`formModel`值做处理，则需要通过该字段来控制状态，默认 true。
  const isFormInitCompleted = ref(true)

  const hasTree = inject('hasTree', false)
  const refreshTree = inject('refreshTree', undefined)
  const optionsOfGetList = inject('optionsOfGetList', null)

  const store = useStore(storeName)
  const commonStore = useStore('./common')

  if (location && !store[location].form) {
    store[location].form = {}
  }

  const formLoading = computed(() => location ? store[location].loading : store.loading)
  const search = computed(() => store.search)
  const form = computed(() => store[location]?.form)
  const currentItem = computed(() => store.currentItem)
  const open = computed(() => store[modalStatusFieldName] || false)
  const formModel = reactive(location ? form.value : search.value)
  const formRules = reactive(rules)
  const initSearchParamResult = ref(searchParamOptions?.length <= 0)
  const hasRequiredEnum = searchParamOptions?.some(_enum => _enum.isRequired === true)
  const route = useRoute()

  const {
    text,
    loading,
    onClick: handleSubmitButtonClick,
    ...restSubmitButtonProps
  } = submitButtonProps

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

  // 处理`formModel`的次数。isGetDetails 为 true 时，最大为2次，为 false 时为1次。
  const count = ref(0)
  // 用于区分当前弹窗的编辑模式：新增数据/编辑数据
  const isNewModal = computed(() => !((store[location]?.rowKey ?? store.rowKey) in currentItem.value))

  if (location) {
    if (location !== 'modalForEditing' && !modalStatusFieldName) {
      throw new Error('TGForm：使用 useTGForm 时缺少参数（modalStatusFieldName）。')
    }

    if (modalStatusFieldName) {
      watch(open, val => {
        if (!val) {
          // 关闭弹窗时，重置计数器
          count.value = 0
          initSearchParamResult.value = false
          // 关闭弹窗，重置表单字段及表单验证信息
          resetFields()
          clearValidate()
        } else {
          const formModelLength = Object.keys(formModel).length
          // 检测对应store[location].form是否预定义了与页面弹窗内表单对应的字段，将影响表单字段的收集
          // formModel 字段数量，排除编辑模式下自动注入的 [rowKey]
          if ((!isNewModal.value && formModelLength <= 1) || (isNewModal.value && !formModelLength)) {
            console.warn(`TGForm：${route.name}.store.${location}.form 未预定义与页面弹窗内表单对应的字段，这会导致编辑表单时无法回填数据！`)
          }
        }
      })
    }

    if (!isSearchForm) {
      // 作为数据表单使用时，将`store.currentItem`和`store[location].form`中的同名字段保持同步
      watch(currentItem, async ci => {
        if (
          // 判断弹窗状态
          open.value &&
          // 判断弹窗主体与当前currentItem数据是否匹配
          location === ci._location &&
          // 判断当前操作是新增还是编辑
          (
            (
              // 判断当前是否是编辑弹窗
              !isNewModal.value &&
              // 判断currentItem更新次数，防止过度监听
              ((isGetDetails && count.value < 2) || (!isGetDetails && count.value < 1))
            ) ||
            (isNewModal.value && count.value < 1)
          )
        ) {
          // 暂时取消依赖字段的监听
          isFormInitCompleted.value = false

          const _formModel = {}

          // 预处理从`currentItem`中同步到`formModel`的数据
          if (Object.keys(ci).length - 3 > 0) {
            // TODO [性能优化]
            //  当 isGetDetails 为 true 时，此处会执行两次。
            //  原因是首次打开弹窗时会为 currentItem 赋值，获取到详情数据后会再次覆盖 currentItem，
            //  导致watch.currentItem执行了两次。
            //  优化方案：1、考虑在第二次执行时跳过已经赋值的字段，仅为新字段赋值。
            //  2、考虑在 isGetDetails 为 true 时，首次监听不执行以下逻辑，在获取到详情数据时一并执行。

            for (const key in formModel) {
              if (key in ci) {
                const formModelKey = formModel[key]
                const currentItemKey = toRaw(ci[key])

                // 引用类型为假值时跳过
                if (!currentItemKey && typeof formModelKey === 'object') {
                  continue
                }

                _formModel[key] = ci[key]
              }
            }
          }

          // 初始化表单默认值，回填表单数据
          store.$patch({
            [location]: {
              form: {
                ..._formModel,
                ...formModelFormatter?.(ci)
              }
            }
          })

          await nextTick()

          // 恢复依赖字段的监听
          isFormInitCompleted.value = true
          // 清空验证信息
          clearValidate()
          count.value++
        }
      }, { deep: true })
    }
  }

  /**
   * 重置表单
   * @param handleFinishOptions {Object} - handleFinish 函数的参数
   * @returns {Promise<void>}
   */
  async function handleClear(handleFinishOptions) {
    resetFields()
    await handleFinish(handleFinishOptions)
  }

  /**
   * 提交表单
   * @param [callback] {()=>void} - 自定义表单验证完成且成功后的逻辑，该参数与本函数的其他所有参数互斥。
   * @param [apiName] {string} - 自定义接口名称，传递此值时，action将失效。
   * @param [action] {'update','add',string} - 操作类型，未定义 apiName 时生效。
   * 默认根据`store.state.currentItem`中的`id`字段自动判断是 'update' 还是 'add'，其他情况则需要自行传递。
   * 主要用于生成接口地址，生成规则`{ACTION}{router.currentRoute.value.name}`。
   * @param [params] {(() => Object) | Object} - 接口参数，默认`store.search`受`isMergeParam`影响。
   * @param [isMergeParam] {boolean} - 是否将 params 参数与默认值合并，默认为 false。
   * 注意合并后不会改变 store 内对应的字段，仅传递给接口使用；不合并时会使用 params 参数覆盖默认值。
   * @param [isRefreshTable=true] {boolean} - 是否刷新表格数据，默认 true。
   * @param [isRefreshTree] {boolean} - 是否在成功提交表单后刷新对应的侧边树，默认 false。
   * 依赖`inject(hasTree)`和`inject(refreshTree)`。
   * @param [success] {(res: Object, currentItemCache: Object) => void} - 操作执行成功后的回调函数，
   * 参数为接口的`Response`和`currentItemCache`。
   */
  async function handleFinish({
    callback,
    apiName,
    action,
    params,
    isMergeParam,
    isRefreshTable = true,
    isRefreshTree,
    success
  } = {}) {
    return new Promise(resolve => {
      validate().then(async () => {
        if (typeof callback === 'function') {
          resolve(await callback())
        } else {
          params = typeof params === 'function' ? params() : params
          const currentItemCache = toRaw(currentItem.value)
          const res = await store.fetch({
            action,
            apiName,
            location,
            params,
            isMergeParam,
            isRefreshTable,
            modalStatusFieldName,
            optionsOfGetList
          })

          resolve(res)

          if (res.status) {
            // 执行侧边树刷新操作
            if (isRefreshTree && hasTree) {
              await refreshTree?.()
            }

            success?.(res, currentItemCache)
          }
        }
      }).catch(e => {
        resolve({ status: false })
      })
    })
  }

  /**
   * 枚举执行函数
   * @param enumOptions
   * @returns {(function(): Promise<(function(): void)|(function(): *)>)|*}
   */
  async function execEnum(enumOptions) {
    const { listener, condition, dependentField, ...options } = enumOptions
    const isContinue = typeof condition === 'function'
      ? condition(store.$state)
      : condition

    if (typeof isContinue !== 'boolean' || isContinue) {
      // 处理依赖参数的初始化
      if (dependentField) {
        const _dependentField = typeof dependentField === 'function'
          ? dependentField(store.$state)
          : dependentField

        unWatch.value.push(watch(
          () => options.location ? form.value[_dependentField] : search.value[_dependentField],
          async (newVal, oldValue) => {
            // 依赖参数变化时，清空有依赖的参数的枚举列表，并重置已选中的值
            if (newVal !== oldValue) {
              clearCache(enumOptions)

              // 依赖值为有效值时才执行枚举刷新
              if (newVal) {
                if (typeof options.customData === 'function') {
                  const data = await options.customData(newVal)

                  if (!Array.isArray(data)) {
                    throw new Error(`自定义枚举 ${options.stateName} 的 customData 函数返回值必须为一个数组。`)
                  }

                  store.setState(options.stateName, data, { location: options.location })
                } else {
                  if (!options.apiName) {
                    throw new Error(`非自定义枚举 ${options.stateName} 必须指定 apiName。`)
                  }

                  await store.getList(options)
                }
              }
            }
          },
          { immediate: true }
        ))
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
                store.saveParamsAndExecSearch()
              }
            }
          )
        }
      }
    }
  }

  function watchTrigger(paramNameInSearchRO) {
    searchParamOptions
      ?.filter(options => options.dependentField === paramNameInSearchRO)
      ?.forEach(options => {
        clearCache(options)
      })
  }

  function clearCache(enumOptions) {
    // 如果外部对formModel的处理还未完成，则此步不做formModel的修改，防止修改冲突
    if (isFormInitCompleted.value) {
      if (enumOptions.location) {
        const paramValue = store[enumOptions.location].form[enumOptions.paramNameInSearchRO]

        if (paramValue === undefined || paramValue === null || typeof paramValue === 'object') {
          // 如果依赖值无变化，不足以触发依赖本字段的其他字段的 watch，则手动触发之
          if (paramValue === undefined || paramValue === null) {
            watchTrigger(enumOptions.paramNameInSearchRO)
          }

          store[enumOptions.location].form[enumOptions.paramNameInSearchRO] = null
        } else {
          if (paramValue === '') {
            watchTrigger(enumOptions.paramNameInSearchRO)
          } else {
            // 搜索表单将默认值重置为“全部”选项，数据表单重置为 null。
            store[enumOptions.location].form[enumOptions.paramNameInSearchRO] = isSearchForm ? '' : null
          }
        }
      } else {
        if (store.search[enumOptions.paramNameInSearchRO] === '') {
          watchTrigger(enumOptions.paramNameInSearchRO)
        } else {
          // 搜索表单将默认值重置为“全部”选项，数据表单重置为 null。
          store.search[enumOptions.paramNameInSearchRO] = isSearchForm ? '' : null
        }
      }
    }

    // 清空枚举列表
    store.setList(enumOptions.stateName, [], enumOptions.location)
  }

  onUnmounted(() => {
    store.$reset()
  })

  const TGForm = {
    name: 'TGForm',
    setup(props, { slots, emit }) {
      const inModal = inject('inModal', false)
      const isInitTable = inject('isInitTable', false)

      if (inModal) {
        const open = computed(() => store[modalStatusFieldName])

        watch(open, async val => {
          if (val) {
            if (hasRequiredEnum) {
              await initSearchParams()
              await getDetails()
            } else {
              if (!initSearchParamResult.value) {
                await Promise.all([
                  getDetails(),
                  initSearchParams()
                ])
              } else {
                await getDetails()
              }
            }

            // 接口加载完毕后对表单的处理逻辑
            typeof loaded === 'function' && loaded(form)
          } else {
            // 关闭弹窗时，取消依赖字段的监听
            unWatch.value.forEach(unWatchCb => {
              unWatchCb()
            })

            // 监听器清空完成后，重置unWatch为空数组
            unWatch.value = []
          }
        }, { immediate: true })
      }

      async function initSearchParams() {
        if (Array.isArray(searchParamOptions) && searchParamOptions.length) {
          await Promise.all(searchParamOptions.map(enumOptions => execEnum(enumOptions)))
        }

        initSearchParamResult.value = true

        return Promise.resolve()
      }

      async function getDetails() {
        let res = {}

        if (isGetDetails) {
          let params

          if (typeof getParams === 'function') {
            params = getParams(currentItem.value)
          } else {
            params = getParams
          }

          if (params || currentItem.value?.[store.rowKey]) {
            res = await store.getDetails({
              location,
              params,
              apiName,
              setValue: setDetails
            })
          }
        }

        return Promise.resolve(res)
      }

      async function handleSubmit() {
        if (typeof handleSubmitButtonClick === 'function') {
          handleSubmitButtonClick()
        } else {
          await handleFinish({
            isRefreshTable: isInitTable,
            ...submitButtonProps.submitOptions
          })
        }
      }

      return () => (
        <Form class={'tg-form'} colon={false} model={formModel} ref={formRef}>
          {slots.default?.()}
          {
            showSubmitButton && (
              <Button
                {...restSubmitButtonProps}
                loading={loading || formLoading.value}
                disabled={loading || formLoading.value}
                onClick={handleSubmit}
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
    confirmLoading: formLoading,
    handleClear,
    initSearchParamResult,
    TGForm,
    formRef
  }
}
