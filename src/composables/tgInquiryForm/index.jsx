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
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue'

/**
 * 必需入参的配置
 * @global
 * @typedef SearchParamOption
 * @property [location] {string} - 在 store.state 中次级模块的字段名称。
 * @property stateName {string} - 在 store.state 中字段的名称。
 * @property [storeName] {string} - stateName 参数值所在 store 的名称，默认为当前上下文所在 store。
 * @property apiName {string} - 接口名称。
 * @property [paramsForGetList={}] {((state: Object) => Object) | Object} - 接口请求时的参数，默认为空对象。
 * @property [isRequired] {boolean} - 是否是必传参数。
 * @property [paramNameInSearchRO] {string} - store.state.search 内对应的字段名。
 * @property [condition] {(() => boolean) | boolean}  - 执行条件。
 * @property [listener] {boolean} - 是否为 store.state.search[paramNameInSearchRO] 设置监听，以在该值变化时更新 store.state.dataSource。
 * @property [getValueFormResponse] {(data: Object[]|Object) => any} - 接口数据加载成功后，paramNameInSearchRO字段的取值逻辑。
 * - 参数 data 为接口请求的数据对象或数据数组；
 * - 返回值将赋值给 store.state.search 对象内 paramNameInSearchRO 指定的字段。
 * @property [raw] {boolean} - 原样输出接口返回的数据结构到 stateName 指定的字段中。
 * @property [done] {(data: Object) => Array<any>} - 当前枚举调用接口后的回调，参数为 response.data。
 * @property [dependentField] {string} - 请求接口所依赖`store.state.search`中的参数名。
 * @property [isDependentTreeNode] {boolean} - 是否依赖本页面左侧的树的选中项。[TODO]
 * @property [onTreeNodeChange] {Function} - 树节点变更回调，依赖 isDependentTreeNode。[TODO]
 * @property [cascadingEnums] {SearchParamOption[]} - 级联配置。[TODO]
 */

/**
 * @param {SearchParamOption[]} [searchParamOptions] - 搜索参数配置。
 * @param {()=>boolean} [buttonDisabledFn] - 禁用查询和重置按钮的方法。
 * @param {Object} [rules={}] - 验证规则，参考 ant-design-vue 的 Form.Item。
 * @param {((state: Object) => Object) | Object} [paramsForGetList={}] - 搜索接口的额外参数，默认为空对象。
 * 注意：
 * - 搜索接口的默认参数为 store.state.search 对象内所有字段，本字段配置的参数会在调用接口前合并到接口参数中，但不会改变 store.state.search 的值。
 * - 如果与 store.state.search 有同名字段，本配置返回的字段的优先级更高。
 * @returns {Promise<{onFinish: onFinish}>}
 */
export default function useInquiryForm({
  searchParamOptions,
  buttonDisabledFn,
  rules = {},
  paramsForGetList = {}
} = {}) {
  const store = useStore()
  const commonStore = useStore('./common')
  const hasTree = inject('hasTree', false)
  const searchParamNameRequired = inject('searchParamNameRequired', [])

  const treeCollapsed = computed(() => commonStore.treeCollapsed)
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

  async function onClear() {
    resetFields(searchParamNameRequired.reduce((acc, paramName) => {
      acc[paramName] = search.value[paramName]
      return acc
    }, {}))
    onFinish()
  }

  function onFinish() {
    validate().then(async () => await store.onSearch())
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
        ? condition()
        : condition

      if (typeof isContinue !== 'boolean' || isContinue) {
        // 处理依赖参数的初始化
        if (dependentField) {
          await new Promise(resolve => {
            watch(() => search.value[dependentField], async (newVal, oldValue) => {
              if (newVal !== oldValue) {
                resolve(await store.getList(options))
              }
            })
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
                  store.onSearch()
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
    const enumFnsOfNotDependentTreeNodeAndNotRequired = []
    const enumFns = (searchParamOptions || []).reduce(
      (fns, enumOptions) => {
        // 处理各枚举的依赖关系，以确定其执行顺序
        if (enumOptions.isRequired) {
          searchParamNameRequired.push(enumOptions.paramNameInSearchRO)

          if (enumOptions.isDependentTreeNode) {
            fns.dependentTreeNode.required.push(execEnum(enumOptions))
          } else {
            fns.notDependentTreeNodeButRequired.push(execEnum(enumOptions))
          }
        } else {
          if (enumOptions.isDependentTreeNode) {
            fns.dependentTreeNode.notRequired.push(execEnum(enumOptions))
          } else {
            enumFnsOfNotDependentTreeNodeAndNotRequired.push(execEnum(enumOptions))
          }
        }

        return fns
      },
      {
        dependentTreeNode: { required: [], notRequired: [] },
        notDependentTreeNodeButRequired: []
      }
    )

    store.taskQueues.notDependentTreeNodeButRequired.push(...enumFns.notDependentTreeNodeButRequired)

    if (hasTree) {
      // 将依赖树节点的枚举保存到队列中
      store.taskQueues.dependentTreeNode.push(
        ...enumFns.dependentTreeNode.required,
        ...enumFns.dependentTreeNode.notRequired
      )
    }

    // 不依赖树节点的非必须枚举队列直接执行
    if (enumFnsOfNotDependentTreeNodeAndNotRequired.length) {
      await Promise.all(enumFnsOfNotDependentTreeNodeAndNotRequired.map(cb => cb()))
    }
  })

  onUnmounted(() => {
    store.$reset()
  })

  /**
   * 渲染
   * @param props
   * @config buttonPermissionIdentification {string} - 自定义按钮的权限标识，默认 'QUERY'。
   * @config disabledButtonPermission {boolean} - 在启用按钮级权限的情况下，是否关闭该模块的按钮权限验证。默认 false。
   * @param slots
   * @returns {JSX.Element}
   */
  function TGInquiryForm(props, { slots }) {
    return (
      <Form
        class={`tg-inquiry-form${treeCollapsed.value ? ' tg-inquiry-side-toggle-reverse' : ''}`}
        layout={'inline'}
        colon={false}
      >
        {slots.others?.(formModel)}
        <div class={'tg-inquiry-row-for-fields'}>
          {slots.default?.(formModel)}
          {
            slots.default && (
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
                        onClick={onFinish}
                      >
                        查询
                      </TGPermissionsButton>,
                      <TGPermissionsButton
                        icon={<ReloadOutlined />}
                        disabledType={disabledType.DISABLE}
                        disabled={loading.value || buttonDisabled.value}
                        identification={props.buttonPermissionIdentification}
                        onClick={onClear}
                      >
                        重置
                      </TGPermissionsButton>
                    ]
                    : [
                      <Button
                        icon={<SearchOutlined />}
                        disabled={loading.value || buttonDisabled.value}
                        loading={loading.value}
                        type="primary"
                        onClick={onFinish}
                      >
                        查询
                      </Button>,
                      <Button
                        disabled={loading.value || buttonDisabled.value}
                        onClick={onClear}
                        icon={<ReloadOutlined />}
                      >
                        重置
                      </Button>
                    ]
                }
              </Space>
            )
          }
        </div>
      </Form>
    )
  }

  return {
    validateInfos,
    resetFields,
    onFinish,
    formModel,
    store,
    commonStore,
    treeCollapsed,
    buttonDisabled,
    loading,
    onClear,
    TGInquiryForm
  }
}
