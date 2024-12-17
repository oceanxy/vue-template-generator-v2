/**
 * store模板
 * @Author: Omsber
 * @Email: xyzsyx@163.com
 * @Date: 2022-06-22 周三 15:18:57
 */

import { defineStore } from 'pinia'
import apis from '@/apis'
import { downloadFile, firstLetterToUppercase, getFirstLetterOfEachWordOfAppName } from '@/utils/utilityFunction'
import { omit } from 'lodash'
import useStore from '@/composables/tgStore'

/**
 * 创建 store
 * @param {string} moduleName - store名称。
 * @param {Object} [module={}] - 需要合并到 store 的 state。
 * @param {string[] | boolean} [excludeFromState=[]] - 需要从 store 中排除的 state 集合，为 true 时将排除所有内置状态。
 * @param {boolean} [isRoot] - 是否是框架级的 store，默认 false。为 true 时将从框架的stores目录中引入模块。
 * @returns {import('pinia').StoreDefinition}
 */
export function createStore({
  moduleName,
  module = {},
  excludeFromState = [],
  isRoot = false
}) {
  let storeName = moduleName
  const MODULE_NAME = firstLetterToUppercase(moduleName)

  if (!isRoot) {
    storeName = `${getFirstLetterOfEachWordOfAppName()}/${moduleName}`
  }

  return defineStore(storeName, {
    state: () => {
      const moduleStates = {
        /**
         * antd vue Table 组件的 rowKey 属性
         */
        rowKey: 'id',
        /**
         * 页面数据源
         */
        dataSource: {
          list: [],
          data: {},
          loading: true
        },
        /**
         * 初始化列表搜索参数（store.state.search）的任务队列
         */
        taskQueues: {
          // 左侧树的数据源加载相关的任务队列
          treeNode: [],
          // 搜索栏必需的参数的任务队列
          required: [],
          // 搜索栏非必需的参数的任务队列
          notRequired: []
        },
        /**
         * 用于接收侧边树选中值的字段名，默认''，通过 @/components/TGContainerWithTreeSider 组件设置。
         * @type {string}
         */
        treeIdField: '',
        /**
         * 搜索对象
         * @type {Object}
         */
        search: {},
        /**
         * 搜索请求对象名。默认null。
         * 一般情况下为空，不为空时，在发送搜索请求时会将请求参数放到 searchRO 所设置值的对象中。
         * @type {string | null}
         * @example
         * 如下设置：
         * {
         *  search: { id: 'id', name: 'test' },
         *  searchRO: '' // 或者其他假值
         * }
         * 请求参数结构为：
         * {
         *  id: 'id',
         *  name: 'test'
         * }
         *
         * 如下设置：
         * {
         *  search: { id: 'id', name: 'test' },
         *  searchRO: 'searchRO'
         * }
         * 请求参数结构为：
         * {
         *  searchRO: {
         *    id: 'id',
         *    name: 'test'
         *  }
         * }
         */
        searchRO: null,
        /**
         * 分页对象
         * @type {Object}
         * @property {number} pageIndex 页码
         * @property {number} pageSize 每页数量
         * @property {number} total 总数量
         */
        pagination: {
          pageIndex: 0,
          pageSize: 10,
          total: 0
        },
        /**
         * 执行查询时是否通过 params 传递分页参数，默认 false
         */
        paginationByParams: false,
        /**
         * 当前项
         * @type {Object}
         */
        currentItem: {},
        sortFieldList: [],
        showModalForEditing: false,
        /**
         * 当前选中行数据
         */
        selectedRows: [],
        ...module.state
      }

      if (typeof excludeFromState === 'boolean') {
        if (excludeFromState) {
          return module.state
        } else {
          return moduleStates
        }
      } else {
        return omit(moduleStates, excludeFromState)
      }
    },
    getters: {
      selectedRowKeys: state => state.selectedRows?.map(item => item[state.rowKey || 'id']) ?? [],
      ...module.getters
    },
    actions: {
      /**
       * 执行表格搜索
       * @param searchParams {Object} - 执行搜索前，需要合并到 store.state.search 的值。搜索接口会调用合并后的 store.state.search。
       * @param isFetchList {boolean=true} - 是否执行列表查询，默认 true。
       * @param isPagination {boolean=true} - 是否分页，默认 true。
       * @param isResetSelectedRows {boolean=true} - 是否重置 store.state.selectedRows，默认 true。
       * @param [location] {string} - 搜索参数所在的 store 的次级模块名称。
       * @param [...optionsOfGetList] {Object}
       * @returns {Promise<void>}
       */
      async onSearch({
        searchParams,
        isFetchList = true,
        isResetSelectedRows = true,
        isPagination = true,
        location,
        ...optionsOfGetList
      } = {}) {
        this.setSearchParams(searchParams, isPagination, location)

        if (isFetchList) {
          await this.execSearch({
            isResetSelectedRows,
            isPagination,
            location,
            ...optionsOfGetList
          })
        }

      },
      async execSearch({
        isResetSelectedRows = true,
        isPagination = true,
        location,
        ...optionsOfGetList
      }) {
        if (isResetSelectedRows) {
          if (!location && 'selectedRows' in this.$state) {
            this.selectedRows = []
          }

          if (location && 'selectedRows' in this.$state[location]) {
            this.$state[location].selectedRows = []
          }
        }

        await this.getList({
          ...optionsOfGetList,
          location,
          isPagination
        })
      },
      /**
       * 设置搜索参数（当搜索参数变化时，会重置分页参数）。
       * 注意该 Action 的使用场景：仅在搜索参数变化时用来更新搜索参数（store.state.search）
       * @param searchParams
       * @param isPagination
       * @param [location]
       */
      setSearchParams(searchParams = {}, isPagination, location) {
        const state = location && this.$state[location] ? this.$state[location] : this.$state

        if (state) {
          if (isPagination && 'pagination' in state) {
            state.pagination.pageIndex = 0
          }

          if ('search' in state) {
            this.$patch({ [location || 'search']: searchParams })
          }
        }
      },
      /**
       * 获取列表、枚举等数据集
       * @param {boolean} [isPagination] - 是否分页。默认 false。
       * @param {string} [location] - 次级表格的 state。
       * @param {string} [apiName] - 请求接口的名称，默认为 `get${router.currentRoute.value.name}`。
       * @param {string} [stateName='dataSource'] - 用以保存请求数据的字段名（store.state 中的字段名），默认为 dataSource。
       * @param {string} [storeName] - stateName 参数值所在 store 的名称，默认为当前上下文所在 store。
       * @param {((state: Object) => Object) | Object} [paramsForGetList={}] - 接口请求时的参数，默认为空对象。
       * @param {boolean} [isMergeParam] - 请求接口时，是否将 paramsForGetList 参数与 store.state.search 合并，
       * 默认 false，不合并，但是如果 paramsForGetList 参数的值不是对象或是一个空对象，则强制使用`store.state.search`的值作为参数。
       * 注意，当值为true时，不会改变`store.state.search`的值，仅仅是在调用接口处传递给接口。如果有同名参数，paramsForGetList 的优先级更高。
       * @param {string} [paramNameInSearchRO] - store.state.search 内对应选中枚举的参数名。
       * @param {boolean | ((data: Object[] | Object) => any)} [getValueFormResponse] - 接口加载成功后，
       * paramNameInSearchRO 参数所指向字段的默认值取值逻辑。默认 false 不取值，为 true 时取数据数组第一项的 ID 值。
       * @param {(data: any, store:import('pinia').StoreDefinition) => void} [setValueToStateName] - 把接口返回的数据
       * （response.data）设置到 stateName 对应字段的自定义实现。
       * 注意：当 raw 为 true 时，该字段不生效。
       * @param {boolean} [isRequired] - 是否是必传参数。
       * @param {boolean} [raw] - 原样输出接口返回的数据结构到页面对应的 store.state.[stateName] 中。
       * @param {boolean} [merge] - 是否合并数据，默认false，主要用于“加载更多”功能。
       * @param {(Object) => any} [done] - 调用接口后的回调，参数为 response.data。
       * @returns {Promise<*>}
       */
      async getList({
        isPagination,
        location,
        apiName,
        stateName = 'dataSource',
        storeName,
        paramsForGetList = {},
        isMergeParam,
        getValueFormResponse,
        setValueToStateName,
        paramNameInSearchRO,
        isRequired,
        raw,
        merge,
        done
      } = {}) {
        let store

        if (storeName && storeName !== moduleName) {
          store = useStore(storeName)
        } else {
          store = this
        }

        store.setLoading({ value: true, stateName, location })

        if (!apiName) {
          apiName = `get${MODULE_NAME}`
        }

        if (!apis[apiName]) {
          throw new Error(`接口 ${apiName} 不存在！`)
        }

        let _paramsForGetList = {}

        if (typeof paramsForGetList === 'function') {
          _paramsForGetList = paramsForGetList(store.$state)
        } else {
          _paramsForGetList = paramsForGetList
        }

        const search = (location ? store[location].form : store.search) || {}

        if (
          Object.prototype.toString.call(_paramsForGetList) !== '[object Object]' ||
          !Object.keys(_paramsForGetList).length
        ) {
          _paramsForGetList = search
        } else if (isMergeParam) {
          _paramsForGetList = { ...search, ..._paramsForGetList }
        }

        const pagination = (location ? store[location].pagination : store.pagination) || {}
        const _pagination = {}

        if (isPagination) {
          _pagination.pageIndex = pagination?.pageIndex
          _pagination.pageSize = pagination?.pageSize
        }

        const paginationByParams = location ? this[location].paginationByParams : this.paginationByParams
        const searchRO = location ? this[location].searchRO : this.searchRO
        const requestObject = {
          ...(!paginationByParams ? _pagination : undefined),
          ...(searchRO ? { [searchRO]: _paramsForGetList } : _paramsForGetList)
        }

        const response = await apis[apiName](requestObject, paginationByParams ? _pagination : undefined)

        if (response.status) {
          if (raw) {
            location
              ? this.$patch({ [location]: { [stateName]: response.data } })
              : this.$patch({ [stateName]: response.data })
          } else {
            const data = response.data?.paginationObj ?? response.data
            const sortFieldList = response.data?.sortFieldList ?? response.data.tag ?? []
            let rows = data?.rows ?? data

            // 若指定字段不是可用的数据数组，则在 rows 对象内寻找数组作为结果返回，
            // 其他字段注入到该模块的 store.state.[stateName].data 中
            if (Object.prototype.toString.call(rows) === '[object Object]') {
              const others = {}
              const isArray = Array.isArray

              Object.entries(rows).forEach(([key, value]) => {
                if (isArray(value)) {
                  rows = value
                } else {
                  others[key] = value
                }
              })

              location
                ? this.$patch({ [location]: { [stateName]: { data: others } } })
                : this.$patch({ [stateName]: { data: others } })
            }

            if (!rows) {
              rows = []
            }

            if (isPagination && 'pageIndex' in data && 'pageSize' in data) {
              if (location && 'pagination' in this.$state[location]) {
                this.$patch({
                  [location]: {
                    pagination: {
                      pageIndex: data.pageIndex || 0,
                      pageSize: data.pageSize || 0,
                      total: data.totalNum
                    }
                  }
                })
              } else if (!location && 'pagination' in this.$state) {
                this.$patch({
                  pagination: {
                    pageIndex: data.pageIndex || 0,
                    pageSize: data.pageSize || 0,
                    total: data.totalNum
                  }
                })
              }
            }

            if (merge) {
              if (location) {
                rows = [...this.$state[location][stateName].list, ...rows]
              } else {
                rows = [...this.$state[stateName].list, ...rows]
              }
            }

            if (sortFieldList?.length) {
              if (location) {
                this.$state[location].sortFieldList = sortFieldList
              } else {
                this.sortFieldList = sortFieldList
              }
            }

            if (typeof setValueToStateName === 'function') {
              setValueToStateName(rows, store)
            } else {
              store.setList(stateName, rows, location)
            }

            if (paramNameInSearchRO) {
              if (typeof getValueFormResponse === 'function') {
                if (!paramNameInSearchRO) {
                  throw new Error(`在请求自定义接口getPermissionMenus时，getValueFormResponse 所依赖的 paramNameInSearchRO 参数未设置！`)
                }

                if (location) {
                  this.$state[location].form[paramNameInSearchRO] = getValueFormResponse?.(store[location][stateName])
                } else {
                  this.search[paramNameInSearchRO] = getValueFormResponse?.(store[stateName])
                }
              } else {
                if (typeof getValueFormResponse === 'boolean' && getValueFormResponse) {
                  if (location) {
                    this.$state[location].form[paramNameInSearchRO] = store[location][stateName]?.list?.[0]?.id ?? ''
                  } else {
                    this.search[paramNameInSearchRO] = store[stateName]?.list?.[0]?.id ?? ''
                  }
                }
              }

              if (
                // getValueFormResponse 值为 true 或为函数的情况，检查是否已成功在 store.state.search 中设置值，否则抛出警告。
                (getValueFormResponse === true || typeof getValueFormResponse === 'function') &&
                !(location ? this.$state[location].form[paramNameInSearchRO] : this.search[paramNameInSearchRO])
              ) {
                const text = `[useInquiryForm] ${moduleName}.state.search.${paramNameInSearchRO} 未成功初始化，可能会出现预期之外的问题！` +
                  `在未传递“getValueFormResponse”的情况下，将默认取值 ${moduleName}.state.${stateName}.list[0].id ，请确认取值方式。`

                if (isRequired) {
                  throw new Error(text)
                } else {
                  console.warn(text)
                }
              }
            }
          }
        }

        store.setLoading({ value: false, stateName, location })
        typeof done === 'function' && done(response.data)

        return response
      },
      /**
       * 获取详情数据
       * @param {string} location
       * @param {Object} [params] - 查询参数，默认`store.currentItem.id`。
       * @param {string} [apiName] - 接口名称，默认`getDetailsOf${moduleName}`。
       * @param {(data: Object, store: import('pinia').StoreDefinition) => void} [setValue] - 处理接口返回值的函数，
       * 该值不为函数时，接口返回值默认与`store.currentItem`合并。
       * @returns {Promise<{}>}
       */
      async getDetails({
        location,
        params,
        apiName,
        setValue
      }) {
        this.setLoading({ value: true, stateName: location })

        let api
        let res = {}

        api = apiName || `getDetailsOf${firstLetterToUppercase(moduleName)}`

        if (apis[api]) {
          res = await apis[api](params || { id: this.currentItem.id })
        } else {
          console.error(`接口未定义：${moduleName} 页面的 ${api} 接口未定义！`)
        }

        if (res.status) {
          if (typeof setValue === 'function') {
            setValue(res.data, this)
          } else {
            this.$patch({
              currentItem: res.data
            })
          }
        }

        this.setLoading({ value: false, stateName: location })

        return res
      },
      /**
       * 设置接口返回的列表/枚举等数据
       * @param stateName {string} - store.state 中的字段名
       * @param value {any} - 值
       * @param [location]
       */
      setList(stateName, value, location) {
        // 空值检查
        if (!stateName) {
          throw new Error('stateName is required')
        }

        const targetState = location ? this.$state[location] : this.$state

        // 边界条件处理
        if (!targetState) {
          throw new Error(`State at location ${location} does not exist`)
        }

        const currentState = targetState[stateName]

        // 类型检查和赋值
        if (currentState && typeof currentState === 'object') {
          if (typeof value === 'object' && !Array.isArray(value)) {
            if ('data' in currentState) {
              currentState.data = value
            } else {
              // 数据结构为自定义的结构
              Object.assign(currentState, value)
            }
          } else if (Array.isArray(value)) {
            currentState.list = value
          } else {
            currentState.data = value
          }
        } else {
          targetState[stateName || 'list'] = value
        }
      },
      /**
       * 设置 store.state 中的值。
       * @param {string} stateName - store.state 中的字段名。不会改变对象或数组的内存地址。
       * @param {any} [value=null] - 值，不传则重置为 null。
       * @param {boolean} [merge=false] - 是否合并，默认 false。
       */
      setState(stateName, value = null, merge = false) {
        if (!stateName) throw new Error('[store.setState] stateName 不能为空！')

        if (merge && typeof this.$state[stateName] === 'object') {
          // 合并数组和对象（不改变原始数组或对象的内存地址）
          if (Array.isArray(this.$state[stateName])) {
            this.$state[stateName].splice(-1, 0, ...value)
          } else {
            Object.entries(value).forEach(([key, value]) => this.$state[stateName][key] = value)
          }
        } else {
          this.$state[stateName] = value

          if (merge && typeof this.$state[stateName] !== 'object') {
            console.warn(`[store.setState] ${moduleName}.state.${stateName}不是数组或对象，只能赋值，不能合并！`)
          }
        }
      },
      /**
       * 设置 loading 状态
       * @param {boolean} [value] - loading 状态。自动为 store.state.dataSource.loading 赋值，不传递该值的情况下默认取反。
       * @param {string} [stateName='dataSource'] - store.state 中的字段名，支持含有`loading`属性的对象或布尔类型的字段。
       * 默认名为'dataSource'的对象。
       * @param {string} [location] - 次级表格的 state。
       */
      setLoading({
        value,
        stateName = 'dataSource',
        location
      } = {}) {
        const setValue = (obj, key, val) => {
          if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
            obj[key].loading = typeof val === 'boolean' ? val : !obj[key].loading
          } else {
            obj[key] = typeof val === 'boolean' ? val : !obj[key]

            if (typeof obj[key] !== 'boolean') {
              console.warn(`store: ${MODULE_NAME}.state.${key} 不是一个布尔值，已被重置为一个布尔值，可能会发生预料之外的错误！`)
            }
          }
        }

        try {
          if (location) {
            if (this.$state[location] && this.$state[location][stateName] !== undefined) {
              setValue(this.$state[location], stateName, value)
            } else {
              console.error(`store: ${MODULE_NAME}.state.${location}.${stateName} 不存在`)
            }
          } else {
            if (this.$state[stateName] !== undefined) {
              setValue(this.$state, stateName, value)
            } else {
              console.error(`store: ${MODULE_NAME}.state.${stateName} 不存在`)
            }
          }
        } catch (error) {
          console.error('设置加载状态时发生错误：', error)
        }
      },
      /**
       * 设置模态框的显示状态
       * @param [modalStatusFieldName='showModalForEditing'] {string} - 模态框的显示状态字段名，默认为 showModalForEditing。
       * @param [value] {boolean} - 显示状态，默认当前值取反，初始值 false。
       * @param [currentItem] {Object} - 当前行数据。
       * @param [merge] {boolean} - 是否合并，默认 false。
       * @param [location='modalForEditing'] {string} - 默认为`modalForEditing`。
       * @param [injectSearchParams] {string[]} - 打开弹窗时，需要从`store.search`传递到`store[location].form`的参数名。
       */
      setVisibilityOfModal({
        modalStatusFieldName = 'showModalForEditing',
        location = 'modalForEditing',
        value,
        currentItem = {},
        merge = false,
        injectSearchParams
      } = {}) {
        this.setState('currentItem', currentItem, merge)

        if (typeof value === 'boolean') {
          this.$state[modalStatusFieldName] = value

          if (!value) {
            this.$state.currentItem = {}
          }
        } else {
          this.$state[modalStatusFieldName] = !this.$state[modalStatusFieldName]
        }

        if (
          this.$state[modalStatusFieldName] &&
          Array.isArray(injectSearchParams) &&
          injectSearchParams.length &&
          location
        ) {
          this.$patch({
            [location]: {
              ['form' in this.$state[location] ? 'form' : 'search']: injectSearchParams.reduce((acc, cur) => {
                acc[cur] = this.search[cur]

                return acc
              }, {})
            }
          })
        }
      },
      /**
       * 更新行状态
       * @param location
       * @param fieldName
       * @param stateName
       * @param apiName
       * @param payload
       * @returns {Promise<*>}
       */
      async updateRowStatus({
        location,
        fieldName,
        stateName,
        apiName,
        payload
      } = {}) {
        this.setLoading({ value: true, stateName, location })

        if (!apiName) {
          apiName = `update${MODULE_NAME}${firstLetterToUppercase(fieldName)}`
        }

        let res = {}

        if (apis[apiName]) {
          res = await apis[apiName](payload)
        } else {
          console.error(`接口未定义：${moduleName} 页面的 ${apiName} 接口未定义！`)
        }

        this.setLoading({ value: false, stateName, location })

        return res.status
      },
      /**
       * 导出表格数据
       * @param {Object} [params] - 参数，默认为 store.state.search 的值。
       * @param {string} [fileName] - 不包含后缀名
       * @param {string} [apiName] - 导出接口的名字
       * @param {string} [modalStatusFieldName] - 成功导出后要关闭的弹窗的控制字段（定义在对应模块的 store.state 内）
       * @param {string} [location]
       * @returns {Promise<*>}
       */
      async exportData({
        params,
        fileName,
        apiName,
        modalStatusFieldName,
        location
      }) {
        const api = apiName ? apiName : `export${MODULE_NAME}`
        let search
        let buffer

        if (apis[api]) {
          if (!location) {
            search = { ...this.search, ...params }
          } else {
            search = { ...this.$state[location].form }
          }

          if ('dateRange' in search) {
            search.startTime = search.dateRange[0]
            search.endTime = search.dateRange[1]

            delete search.dateRange
          }

          buffer = await apis[api]?.(search)
        } else {
          console.error(`接口未定义：${moduleName} 页面的 ${api} 接口未定义！`)
        }

        if (buffer) {
          const blob = new Blob([buffer])

          downloadFile(blob, fileName ? `${fileName}` : undefined)

          if (modalStatusFieldName) {
            this.setState(modalStatusFieldName, false)
          }
        }

        return buffer
      },
      /**
       *
       * @param [location]
       * @param [apiName] {string} - 接口名称，默认值为 `${ACTION}${MODULE_NAME}`。
       * @param [action] {'update','add',string} - 操作类型，未定义 apiName 时生效。
       * 默认根据`store.state.currentItem`中的`id`字段自动判断是 'update' 还是 'add'，其他情况则需要自行传递。
       * 主要用于生成接口地址，生成规则`{ACTION}{ModuleName}`。
       * @param [params] {Object} - 自定义参数，默认值为 store.state.search 的值。
       * 当 location 为有效值时，默认值为 store.state[location].form 的值。
       * @param [isMergeParam] {boolean} - 是否将 params 参数与默认值合并，默认为 false。
       * 注意合并后不会改变 store 内对应的字段，仅传递给接口使用；不合并时会使用 params 参数覆盖默认值。
       * @param [isRefreshTable] {boolean} - 是否刷新表格数据，默认 false。
       * @param [modalStatusFieldName] {string} - 弹窗状态字段名，用于操作完成后关闭指定弹窗。
       * @returns {Promise<Object>}
       */
      async fetch({
        location,
        apiName,
        action,
        params,
        isMergeParam,
        isRefreshTable,
        modalStatusFieldName
      }) {
        let res = { status: false }

        this.setLoading(location ? { stateName: location } : {})

        if (!apiName) {
          if (!action) {
            action = this.currentItem.id ? 'update' : 'add'
          }

          apiName = `${action}${MODULE_NAME}`
        }

        const search = location ? this.$state[location].form : this.search

        if (params) {
          if (isMergeParam) {
            params = { ...search, ...params }
          }
        } else {
          params = search
        }

        if (apis[apiName]) {
          res = await apis[apiName]?.(params)
        } else {
          console.error(`接口未定义：${moduleName} 页面的 ${apiName} 接口未定义！`)
        }

        this.setLoading(location ? { stateName: location } : {})

        if (res.status) {
          // 关闭编辑弹窗
          if (modalStatusFieldName && this.$state[modalStatusFieldName]) {
            this.setVisibilityOfModal({
              modalStatusFieldName,
              location
            })
          }

          if (isRefreshTable) {
            await this.getList({
              isPagination: true
            })
          }
        }

        return res
      },
      ...module.actions
    }
  })
}
