import './assets/styles/index.scss'
import TGContainerWithTreeSider from '@/components/TGContainerWithTreeSider'
import { message, Space } from 'ant-design-vue'
import router from '@/router'
import { computed, nextTick, onMounted, provide } from 'vue'
import useStore from '@/composables/tgStore'

export default {
  name: 'TGContainer',
  inheritAttrs: false,
  props: {
    // 是否自动初始化页面数据（页面数据接口按照`get{router.currentRoute.value.name}`格式定义）
    // 注意：使用了`slots.table`才会生效。
    isInitTable: {
      type: Boolean,
      default: true
    },
    // 是否显示侧边树
    showTree: {
      type: Boolean,
      default: false
    },
    // 是否显示页面标题
    showPageTitle: {
      type: Boolean,
      default: true
    },
    // 自定义容器的额外样式表
    contentClassName: {
      type: String,
      default: ''
    },
    // 获取页面主数据时是否需要分页，主数据是指 router.currentRoute.value.name 指向的接口数据
    isPagination: {
      type: Boolean,
      default: true
    },
    ...TGContainerWithTreeSider.props,
    injectSearchParamsOfTable: {
      type: Function,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const store = useStore()

    const taskQueues = computed(() => store.taskQueues)

    const {
      showTree,
      contentClassName,
      showPageTitle,
      isPagination,
      optionsOfGetList,
      injectSearchParamsOfTable,
      ...treeProps
    } = props

    const _isInitTable = computed(() => {
      return props.isInitTable && !!slots.table && 'dataSource' in store.$state
    })

    provide('initSearchParameters', initSearchParameters)
    // 提供给所有子级或插槽，以判断本页面是否存在列表组件
    provide('isInitTable', _isInitTable.value)

    onMounted(async () => {
      if (!_isInitTable.value) {
        store.dataSource.loading = false
      }

      // 任务队列的初始化在 TGInquiryForm 中进行，当未传递 inquiry 组件时，将在此初始化任务队列，以满足后续逻辑需要
      if (!slots.inquiry) {
        store.taskQueues.required = []
        store.taskQueues.notRequired = []
      }

      await initSearchParameters({ isFirstTime: true })
    })

    /**
     * 参数初始化
     * @param [isFirstTime] {boolean} - 是否是首次初始化
     * @param [searchParams]
     * @returns {Promise<Object>}
     */
    async function initSearchParameters({
      isFirstTime = false,
      searchParams
    } = {}) {
      let payload = {}

      try {
        if (showTree && isFirstTime && Array.isArray(taskQueues.value.treeNode)) {
          /* 初始化侧边树 */
          const result = await Promise.all(taskQueues.value.treeNode)

          for (const _payload of result) {
            payload = { ...payload, ..._payload }
          }
        }

        // 注入额外的搜索参数，注意：侧边树的搜索参数注入不在此组件内执行
        if (!showTree && typeof injectSearchParamsOfTable === 'function') {
          payload = injectSearchParamsOfTable({})
        }

        /* 执行枚举初始化并注册枚举值监听器 */
        if (isFirstTime) {
          if (slots.inquiry) {
            // 任务队列因为任何故障导致未完成初始化，则不进行下一步操作
            // 这个故障可能包括组件报错、路有变化（快速切换路由，组件已经被卸载）等原因
            if (!Array.isArray(taskQueues.value.required)) return

            // 首次初始化时延迟执行非必需的枚举，以节省请求表格的资源
            const requiredResponses = await Promise.all(taskQueues.value.required.map(cb => cb()))

            // 必需参数初始化失败，则取消后续操作
            if (
              (taskQueues.value.required?.length && !requiredResponses.length) ||
              requiredResponses.some(res => res?.message === 'canceled')
            ) {
              return
            } else if (requiredResponses.some(res => !res.status)) {
              message.error('页面加载异常，请稍后再试。')
              return console.error('页面必需参数加载异常')
            }

            if (!Array.isArray(taskQueues.value.notRequired)) {
              return
            }

            // 请求页面主数据
            const notRequiredResponses = await Promise.all([
              // 执行搜索
              saveParamsAndExecSearch(payload),
              // 首次初始化时可将非必需的枚举初始化流程延迟到此时执行
              ...taskQueues.value.notRequired.map(cb => cb())
            ])

            // 执行监听器
            for (const res of [...requiredResponses, ...notRequiredResponses]) {
              if (res.status && typeof res.execListener === 'function') {
                res.execListener()
              }
            }
          } else {
            if (_isInitTable.value) {
              // 直接执行搜索
              await store.execSearch({
                isPagination,
                ...(optionsOfGetList ?? {})
              })
            }
          }
        } else {
          // 参数更新，触发有依赖的字段的 watch
          store.setSearchParams(searchParams)

          if (_isInitTable.value) {
            // 等待搜索枚举中有依赖字段的参数重置完成
            await nextTick()

            // 执行搜索
            await store.execSearch({
              isPagination,
              ...(optionsOfGetList ?? {})
            })
          }
        }
      } catch (error) {
        if ('dataSource' in store.$state) {
          // 树数据加载失败，退出后续所有的数据加载逻辑
          store.dataSource.loading = false
        }

        console.error(error)
      }
    }

    async function saveParamsAndExecSearch(searchParams) {
      if (_isInitTable.value) {
        return await store.saveParamsAndExecSearch({
          searchParams,
          isResetSelectedRows: true,
          isPagination,
          ...(optionsOfGetList ?? {})
        })
      } else {
        return Promise.resolve({
          status: true,
          message: '当前页面不存在列表或不执行列表数据初始化。'
        })
      }
    }

    function filterSlots() {
      return [
        slots.inquiry && (
          <div class={'tg-container-inquiry-wrapper'}>
            {slots.inquiry()}
          </div>
        ),
        slots.chart && (
          <div class={'tg-container-chart-wrapper'}>
            {slots.chart()}
          </div>
        ),
        // default 和 table 结构只能二选一，如果二者都存在，table 优先
        slots.table
          ? (
            <div class={'tg-container-table-wrapper'}>
              {slots.table()}
            </div>
          )
          : slots.default &&
          (
            <div class={'tg-container-content-wrapper'}>
              <div
                class={
                  `tg-container-others-content${contentClassName
                    ? ` ${contentClassName}`
                    : ''}`
                }
              >
                {slots.default()}
              </div>
              {
                slots.bottomFunctions && (
                  <div class={'tg-container-bottom-functions'}>
                    {slots.bottomFunctions()}
                  </div>
                )
              }
            </div>
          ),
        slots.modals && <div class="tg-container-modals">{slots.modals()}</div>
      ]
    }

    return () => (
      <div class={`tg-container${attrs.class ? ` ${attrs.class}` : ''}`}>
        {
          (showPageTitle || slots.function) && (
            <div class={'tg-container-title'}>
              {
                showPageTitle && (
                  <Space class={'tg-container-title-content'}>
                    {
                      router.currentRoute.value.meta.icon && (
                        <IconFont type={router.currentRoute.value.meta.icon} />
                      )
                    }
                    {router.currentRoute.value.meta.title}
                  </Space>
                )
              }
              {
                slots.function && (
                  <div class={'tg-container-function'}>
                    {slots.function()}
                  </div>
                )
              }
            </div>
          )
        }
        {
          showTree
            ? (
              <TGContainerWithTreeSider
                class={'tg-container-content'}
                injectSearchParamsOfTable={injectSearchParamsOfTable}
                {...treeProps}
              >
                {filterSlots()}
              </TGContainerWithTreeSider>
            )
            : <div class={'tg-container-content'}>{filterSlots()}</div>
        }
      </div>
    )
  }
}
