import './index.scss'
import { Pagination } from 'ant-design-vue'
import { computed, inject, ref } from 'vue'
import { omit } from 'lodash'

const TGPagination = {
  props: {
    /**
     * 请求数据的自定义接口
     */
    customApiName: {
      type: String,
      default: ''
    },
    /**
     * 是否导入本页面路由的 query 作为请求分页数据的参数。非子模块默认true，子模块默认false。
     * 具体逻辑见 injectQuery 监听
     */
    injectQuery: {
      type: Boolean,
      default: null
    },
    /**
     * 是否在子模块的分页请求参数中注入父级模块的 store.state.search 搜索对象。仅在子模块内的分页请求生效。
     * 是否注入父级模块的 state.search 搜索参数。依赖 submoduleName，默认 false
     * 一般用于子模块请求数据的接口需要附带父模块参数的情况
     */
    injectParentSearch: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const appName = process.env.TG_APP_NAME
    const moduleName = inject('moduleName')
    const submoduleName = inject('submoduleName')

    const a = import(`@/apps/${appName}/stores/${moduleName}/`)

    const paginationProps = ref({
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: total => `共 ${total} 条`
    })

    const pagination = computed(() => {
      let pagination = this.getState('pagination', moduleName, submoduleName)

      pagination = {
        ...pagination,
        current: pagination.pageIndex + 1
      }

      return pagination
    })

    const paginationOn = computed(() => ({
      change: async (page, pageSize) => {
        await this.fetchList(page - 1, pageSize)
      },
      showSizeChange: async (currentPage, size) => {
        // 改变每页显示条数后，回到第一页
        await this.fetchList(0, size)
      }
    }))

    const attributes = computed(() => ({
      props: omit({
        ...paginationProps.value,
        ...pagination.value
      }, ['pageIndex']),
      on: paginationOn
    }))

    return () => <Pagination class="tg-pagination"{...attributes} />
  }
}

export default TGPagination
