import './assets/styles/index.scss'
import TGContainerWithTreeSider from '@/components/TGContainerWithTreeSider'
import { Space } from 'ant-design-vue'
import router from '@/router'
import { onMounted, provide } from 'vue'
import useStore from '@/composables/tgStore'

export default {
  name: 'TGContainer',
  inheritAttrs: false,
  props: {
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
    customContentClassName: {
      type: String,
      default: ''
    },
    // 获取页面主数据时是否需要分页，主数据是指 moduleName 指向的接口数据
    isPagination: {
      type: Boolean,
      default: true
    },
    ...TGContainerWithTreeSider.props
  },
  setup(props, { slots, attrs }) {
    const store = useStore()
    const {
      showTree,
      customContentClassName,
      showPageTitle,
      isPagination,
      optionsOfGetList,
      injectSearchParamsOfTable,
      ...treeProps
    } = props

    // 提供给所有子级或插槽，以判断本页面是否存在列表组件
    provide('isTableExist', !!slots.table)

    function filterSlots() {
      return [
        slots.inquiry?.() ?? slots.others?.(),
        slots.chart?.(),
        // customContent 和 table 结构只能二选一，如果二者都存在，customContent 优先
        slots.customContent
          ? (
            <div class={'tg-container-custom-content-container'}>
              <div
                class={
                  `tg-container-custom-content${customContentClassName
                    ? ` ${customContentClassName}`
                    : ''}`
                }
              >
                {slots.customContent()}
              </div>
              {
                slots.bottomFunctions && (
                  <div class={'tg-container-bottom-functions'}>
                    {slots.bottomFunctions()}
                  </div>
                )
              }
            </div>
          )
          : slots.table && (
          <div class={'tg-container-table-container'}>
            {slots.table?.()}
            {slots.default?.()}
          </div>
        ),
        slots.modals && <div class="tg-container-modals">{slots.modals()}</div>
      ]
    }

    onMounted(async () => {
      let payload = {}

      try {
        if (showTree) {
          // 初始化侧边树
          const result = await Promise.all(store.taskQueues.treeNode)

          for (const _payload of result) {
            payload = { ...payload, ..._payload }
          }
        }

        // 执行枚举初始化
        const listeners = await Promise.all([
          ...store.taskQueues.dependentTreeNode.map(cb => cb()),
          ...store.taskQueues.notDependentTreeNodeButRequired.map(cb => cb())
        ])

        // 注册枚举值监听器
        for (const listener of listeners) {
          listener()
        }

        if (typeof injectSearchParamsOfTable === 'function') {
          payload = { ...payload, ...injectSearchParamsOfTable({}) }
        }

        await store.onSearch({
          searchParams: payload,
          isResetSelectedRows: true,
          isPagination,
          ...(optionsOfGetList ?? {})
        })
      } catch (error) {
        // 树数据加载失败，退出后续所有的数据加载逻辑
        store.dataSource.loading = false
        console.error(error)
      }
    })

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
                optionsOfGetList={optionsOfGetList}
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
