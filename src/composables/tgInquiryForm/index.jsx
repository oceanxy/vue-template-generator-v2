/**
 * 页面搜索
 * @Author: Omsber
 * @Email: xyzsyx@163.com
 * @Date: 2024-10-18 周五 15:44:52
 */

import './assets/styles/index.scss'
import useStore from '@/composables/tgStore'
import { computed, inject, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { Button, Form, Space } from 'ant-design-vue'
import configs from '@/configs'
import TGPermissionsButton, { disabledType } from '@/components/TGPermissionsButton'
import { DownOutlined, ReloadOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons-vue'

/**
 * 必需入参的配置
 * @global
 * @typedef SearchParamOption
 * @property stateName {string} - 在 store.state 中字段的名称。
 * @property [location] {string} - 在 store.state 中次级模块的字段名称。
 * @property [storeName] {string} - stateName 参数值所在 store 的名称，默认为当前上下文所在 store。
 * @property [apiName] {string} - 接口名称。
 * @property [paramsForGetList={}] {((state: Object) => Object) | Object} - 接口请求时的参数，默认为空对象。
 * @property [paramNameInSearchRO] {string} - store.state.search 内对应的字段名, 注意，一些配置会依赖该属性。
 * @property [isRequired] {boolean} - 是否是必传参数，依赖`paramNameInSearchRO`参数。
 * @property [condition] {((state: Object) => boolean) | boolean}  - 执行枚举初始化/更新的条件。
 * @property [listener] {boolean} - 是否为 store.state.search[paramNameInSearchRO] 设置监听，以在该值变化时更新 store.state.dataSource。
 * @property [getValueFormResponse] {(data: Object[]|Object) => any} - 接口数据加载成功后，`paramNameInSearchRO`字段的取值逻辑。
 * - 参数 data 为接口请求的数据对象或数据数组；
 * - 返回值将赋值给 store.state.search 对象内 paramNameInSearchRO 指定的字段。
 * @property [raw] {boolean} - 原样输出接口返回的数据结构到 stateName 指定的字段中。
 * @property [done] {(data: Object) => Array<any>} - 当前枚举调用接口后的回调，参数为 response.data。
 * @property [dependentField] {string | ((store) => string)} - 请求接口所依赖`store.state.search`中的参数名，
 * 依赖`paramNameInSearchRO`参数。
 * @property [customData] {(dependentField) => Array} - 不请求接口，自定义数据的生成。
 * 依赖 dependentField。使用此参数时 apiName 及接口请求相关的参数都将失效。
 */

/**
 * @param {SearchParamOption[]} [searchParamOptions] - 搜索参数配置。
 * @param {()=>boolean} [buttonDisabledFn] - 禁用查询和重置按钮的方法。
 * @param {Object} [rules={}] - 验证规则，参考 ant-design-vue 的 Form.Item。
 * @returns {{}}
 */
export default function useInquiryForm({
  searchParamOptions,
  buttonDisabledFn,
  rules = {}
} = {}) {
  const store = useStore()
  const commonStore = useStore('/common')
  const searchParamNameRequired = inject('searchParamNameRequired', [])

  const treeCollapsed = computed(() => commonStore.treeCollapsed)
  const inquiryFormCollapsed = computed(() => commonStore.inquiryFormCollapsed)
  const loading = computed(() => store.dataSource.loading)
  const search = computed(() => store.search)

  const formModel = reactive(search.value)
  const formRules = reactive(rules)

  // 按钮禁用状态
  const buttonDisabled = ref(false)

  if (typeof buttonDisabledFn === 'function') {
    watch(formModel, () => buttonDisabled.value = buttonDisabledFn())
  }

  const { resetFields, validate, validateInfos } = Form.useForm(formModel, formRules)

  async function handleClear() {
    // 防止必填属性被清空
    resetFields(searchParamNameRequired.reduce((acc, paramName) => {
      acc[paramName] = search.value[paramName]
      return acc
    }, {}))

    handleFinish()
  }

  function handleFinish() {
    validate().then(async () => await store.saveParamsAndExecSearch())
  }

  /**
   * 枚举执行函数
   * @param enumOptions
   * @returns {(function(): Promise<(function(): void)|undefined>)|*}
   */
  function execEnum(enumOptions) {
    return async () => {
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

          await new Promise(resolve => {
            watch(
              () => search.value[_dependentField],
              async (newVal, oldValue) => {
                if (newVal !== oldValue) {
                  let res

                  // 依赖参数变化时，清空有依赖的参数的枚举列表，并重置已选中的值
                  store.search[enumOptions.paramNameInSearchRO] = ''
                  store.setList(options.stateName, [], options.location)

                  if (typeof options.customData === 'function') {
                    const data = await options.customData(newVal)

                    if (!Array.isArray(data)) {
                      throw new Error(`自定义枚举 ${options.stateName} 的 customData 函数返回值必须为一个数组。`)
                    }

                    store.setState(options.stateName, data)
                    res = { status: true, data }
                  } else {
                    if (!options.apiName) {
                      throw new Error(`非自定义枚举 ${options.stateName} 必须指定 apiName。`)
                    }

                    res = await store.getList(options)
                  }

                  // 完成 promise
                  resolve(res)
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
              () => search.value[enumOptions.paramNameInSearchRO],
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
  }

  /**
   * 必传枚举和非必传枚举的数据初始化
   */
  onMounted(async () => {
    const enumFns = (searchParamOptions || []).reduce(
      (enumFns, enumOptions) => {
        // 处理各枚举的依赖关系，以确定其执行顺序
        if (enumOptions.isRequired) {
          searchParamNameRequired.push(enumOptions.paramNameInSearchRO)
          enumFns.required.push(execEnum(enumOptions))
        } else {
          enumFns.notRequired.push(execEnum(enumOptions))
        }

        return enumFns
      },
      { required: [], notRequired: [] }
    )

    // 将依赖树节点的枚举保存到队列中
    store.taskQueues.required.push(...enumFns.required)
    store.taskQueues.notRequired.push(...enumFns.notRequired)
  })

  onUnmounted(() => {
    store.$reset()
  })

  /**
   * 渲染
   * @param props
   * @config fixedColumns {boolean} - 是否固定每行显示FormItem的个数。默认 false。
   * @config buttonPermissionIdentification {string} - 自定义按钮的权限标识，默认 'QUERY'。
   * @config disabledButtonPermission {boolean} - 在启用按钮级权限的情况下，是否关闭该模块的按钮权限验证。默认 false。
   * @param slots
   * @returns {JSX.Element}
   */
  const TGInquiryForm = {
    name: 'TGInquiryForm',
    props: {
      fixedColumns: {
        type: Boolean,
        default: false
      },
      buttonPermissionIdentification: {
        type: String,
        default: 'QUERY'
      },
      disabledButtonPermission: {
        type: Boolean,
        default: false
      }
    },
    setup(props, { slots }) {
      const fieldDom = ref()
      const showInquiryFormCollapsedButton = ref(true)

      watch(() => fieldDom.value?.querySelectorAll('.ant-form-item')?.length, val => {
        showInquiryFormCollapsedButton.value = props.fixedColumns && val > 7
      }, { immediate: true })

      async function handleInquiryFormCollapsedChange() {
        const heightDifference = fieldDom.value.parentNode.clientHeight - fieldDom.value.clientHeight

        // 为父容器赋值初始值，不然第一次折叠没有动画
        fieldDom.value.parentNode.style.height = fieldDom.value.parentNode.clientHeight + 'px'
        // 折叠/展开
        fieldDom.value.classList.toggle('collapsed')
        // 变更全局状态
        commonStore.inquiryFormCollapsed = !inquiryFormCollapsed.value
        // 为父容器从新计算高度
        fieldDom.value.parentNode.style.height = (fieldDom.value.clientHeight + heightDifference) + 'px'
      }

      return () => (
        <Form
          class={
            `tg-inquiry-form${
              props.fixedColumns ? ' fixed' : ''
            }${
              treeCollapsed.value ? ' tg-inquiry-side-toggle-reverse' : ''
            }`
          }
          layout={'inline'}
          colon={false}
        >
          <div class={'tg-inquiry-form-content'}>
            {slots.others?.(formModel)}
            {
              slots.default && (
                <div
                  ref={fieldDom}
                  class={'tg-inquiry-row-for-fields collapsed'}
                >
                  {slots.default?.(formModel)}
                  <Space class={'tg-inquiry-row-for-buttons'}>
                    {
                      configs.buttonPermissions && !props.disabledButtonPermission
                        ? [
                          <TGPermissionsButton
                            type="primary"
                            icon={<SearchOutlined />}
                            loading={loading.value}
                            disabledType={disabledType.DISABLE}
                            disabled={loading.value || buttonDisabled.value}
                            identification={props.buttonPermissionIdentification}
                            onClick={handleFinish}
                          >
                            查询
                          </TGPermissionsButton>,
                          <TGPermissionsButton
                            icon={<ReloadOutlined />}
                            disabledType={disabledType.DISABLE}
                            disabled={loading.value || buttonDisabled.value}
                            identification={props.buttonPermissionIdentification}
                            onClick={handleClear}
                          >
                            重置
                          </TGPermissionsButton>
                        ]
                        : [
                          <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            disabled={loading.value || buttonDisabled.value}
                            loading={loading.value}
                            onClick={handleFinish}
                          >
                            查询
                          </Button>,
                          <Button
                            icon={<ReloadOutlined />}
                            disabled={loading.value || buttonDisabled.value}
                            onClick={handleClear}
                          >
                            重置
                          </Button>
                        ]
                    }
                  </Space>
                </div>
              )
            }
          </div>
          {
            showInquiryFormCollapsedButton.value && (
              <div class={'tg-inquiry-form-collapse-button'}>
                <Button
                  icon={inquiryFormCollapsed.value ? <DownOutlined /> : <UpOutlined />}
                  onClick={handleInquiryFormCollapsedChange}
                />
              </div>
            )
          }
        </Form>
      )
    }
  }

  return {
    validateInfos,
    resetFields,
    handleFinish,
    formModel,
    store,
    commonStore,
    treeCollapsed,
    buttonDisabled,
    loading,
    handleClear,
    TGInquiryForm
  }
}
