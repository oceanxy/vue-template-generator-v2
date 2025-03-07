/**
 * 总路由器
 * @Author: Omsber
 * @Email: xyzsyx@163.com
 * @Date: 2023-02-22 周三 18:21:06
 */

import { createRouter as _createRouter, createWebHashHistory, createWebHistory, useRouter } from 'vue-router'
import configs from '@/configs'
import { getCookie } from '@/utils/cookie'
import { getFirstLetterOfEachWordOfAppName } from '@/utils/utilityFunction'
import getBaseRoutes from '@/router/routes'
import { message } from 'ant-design-vue'
import { getEnvVar } from '@/utils/env'
import dayjs from 'dayjs'
import useStore from '@/composables/tgStore'

const appName = getFirstLetterOfEachWordOfAppName()
let abortController = createAbortController()
let isAppStarted = false

__TG_APP_ROUTES__.default?.forEach(route => {
  if (route.path.startsWith('{appName}')) {
    route.path = route.path.replace('{appName}', appName)
  }
})

function createAbortController() {
  return new AbortController()
}

function getAbortController() {
  return abortController
}

/**
 * 根据后台数据生成路由
 * @param {Object[]} [menus] 用来生成菜单的数据
 * @param {import ('vue-router').RouteRecord[]} appRoutes - 子项目路由
 * @param {(path:string, target:string) => void} [redirectCallback] - 外部跳转自定义回调，
 * 默认使用以下代码跳转：
 * ```
 *  window.open(menu.obj.component, '_blank')
 * ```
 * @returns {import ('vue-router').RouteRecord[]}
 */
function initializeDynamicRoutes(menus, appRoutes, redirectCallback) {
  if (!Array.isArray(menus)) return []

  let routes = []

  for (const menu of menus) {
    let route = null
    const { children, obj: { name } } = menu

    const appRoute = appRoutes.find(route => {
      const { isShow, status } = menu.obj
      let url = menu.obj.menuUrl || ''

      if (url.startsWith('{appName}')) {
        url = url.replace('{appName}', appName)
      }

      return (!name || route.name === name) && (!url || route.path === url) && isShow === 1 && status === 1
    })

    if (appRoute) {
      route = { ...appRoute }

      if (route.children) {
        route.children = initializeDynamicRoutes(children, appRoute.children, redirectCallback)
      }
    }

    if (route) {
      routes.push(route)
    }
  }

  return routes
}

/**
 * 从用户信息映射文件选取菜单数据
 * @param menus ｛VueRoute[]｝ - 从用户信息映射来的菜单数据，数据类型为vue-router的路由格式
 * @param routes ｛VueRoute[]｝ - 本项目的路由文件
 * @return {*[]}
 */
function selectDynamicRoutes(menus, routes) {
  if (routes.length) {
    const _routes = []

    routes?.forEach(route => {
      const _menu = menus.find(menu => menu.meta.title === route.meta.title && menu.path?.trim() === route.path)

      if (_menu) {
        if (_menu?.children?.length && route?.children?.length) {
          route.children = selectDynamicRoutes(_menu.children, route.children)
        }

        if (!_menu?.children?.length && route?.children?.length) {
          route.children = []
        }

        if (_menu?.children?.length && !route?.children?.length) {
          console.warn(`未找到ID为${_menu.id}的菜单数据，请确认后台返回的菜单数据与前端路由文件是否匹配！`)
        }

        _routes.push(route)
      }
    })

    return _routes
  } else {
    message.error('未获取到动态菜单数据，请重新登录以完成菜单初始化')
    throw new Error('未获取到动态菜单数据，请重新登录以完成菜单初始化')
  }
}

/**
 * 创建一个路由器
 * @param {import ('vue-router').RouteRecord[]} [rootRoute] - 跟路由
 * @returns {import ('vue-router').Router}
 */
function createRouter(rootRoute) {
  const base = getEnvVar('TG_APP_PUBLIC_PATH')
  const routes = rootRoute || getRoutes()

  return _createRouter({
    routes,
    history: configs.routeMode === 'history' ? createWebHistory(base) : createWebHashHistory(base)
  })
}

/**
 * 获取路由
 * @return {import ('vue-router').RouteRecord[]}
 */
function getRoutes() {
  const { NODE_ENV, TG_APP_DEVELOPMENT_ENVIRONMENT_SKIPPING_PERMISSIONS } = process.env

  if (
    // 本地开发环境跳过权限直接获取本地路由
    (NODE_ENV === 'development' && TG_APP_DEVELOPMENT_ENVIRONMENT_SKIPPING_PERMISSIONS === 'on') ||
    // 或启用本地路由
    !configs.dynamicRouting
  ) {
    return getBaseRoutes(__TG_APP_ROUTES__.default)
  }

  const token = localStorage.getItem(`${appName}-${configs.tokenConfig.fieldName}`)
  const menu = JSON.parse(localStorage.getItem(`${appName}-menu`))

  console.log(menu)

  if (menu && token) {
    // if (USER_INFO_MAPPINGS) {
    //   return getBaseRoutes(selectDynamicRoutes(menu, __TG_APP_ROUTES__?.default || []))
    // }

    return getBaseRoutes(initializeDynamicRoutes(menu[0].children, __TG_APP_ROUTES__.default, __TG_APP_ROUTES__.open))
  }

  return getBaseRoutes()
}

/**
 * 重置路由
 */
async function resetRouter() {
  return new Promise(resolve => {
    const menus = getRoutes()

    router.clearRoutes()
    menus.forEach(route => router.addRoute(route))

    resolve()
  })
}

const router = createRouter()

router.afterEach((to, from) => {
  // 应用启动，首次加载
  if (!isAppStarted) {
    isAppStarted = true
  }
})

router.beforeEach(async (to, from, next) => {
  // vue路由跳转时取消上一个页面的http请求
  abortController.abort()
  abortController = createAbortController()

  // 如果路由中存在title，则使用路由的title作为页面标题
  if (to.query.title) {
    to.meta.title = decodeURIComponent(to.query.title)
  }

  let title = to.meta.title || ''

  if (title) {
    title += ' | '
  }

  document.title = title + configs.systemName

  // 从search中获取token
  const searchToken = new URL(window.location.href).searchParams.get(configs.tokenConfig.fieldName)
  // 通过地址栏传递 token 的情况，优先使用地址栏的 token。因为本地存储的 token 可能已过期（上一次页面关闭时未清空）
  const token = searchToken || to.query[configs.tokenConfig.fieldName]
  // 获取存储在localStorage内的token，防止刷新页面导致store被清空而跳转到登录页
  const localToken = localStorage.getItem(`${appName}-${configs.tokenConfig.fieldName}`)
  // 某些第三方不通过地址栏传递 token，而通过 cookie 的方式传递 token
  const cookieToken = getCookie(configs.tokenConfig.fieldName)

  // 验证页面是否需要权限才能进入
  if (
    to.meta.requiresAuth &&
    // 生产环境开启跳过权限验证
    !(
      process.env.NODE_ENV === 'development' &&
      process.env.TG_APP_DEVELOPMENT_ENVIRONMENT_SKIPPING_PERMISSIONS === 'on'
    )
  ) {
    let isLoginInvalid = false

    if (!isAppStarted) {
      const loginStore = useStore('/login')
      const _lastLoginTime = localStorage.getItem(`${appName}-lastLoginTime`) || loginStore.lastLoginTime

      isLoginInvalid = !_lastLoginTime || dayjs().diff(dayjs(_lastLoginTime), 'hour') >= 2

      if (isLoginInvalid) {
        loginStore.clear()
      }
    }

    if (
      !localToken ||
      // 如果地址栏带了 token，且与本地存储的 token 不一致，强制重定向到登录页鉴权
      (token && token !== localToken) ||
      // 处理某些第三方不通过地址栏传递 token，而通过 cookie 的方式传递 token 的情况
      (cookieToken && cookieToken !== localToken) ||
      // 判断是否为第一次进入应用，如果为第一次进入应用，则判断是否已超过2小时，如果超过2小时，则强制重定向到登录页鉴权
      !isAppStarted && isLoginInvalid
    ) {
      next({
        ...to,
        name: 'Login',
        query: {
          // 将跳转的路由path作为参数，登录成功后跳转到该路由
          redirect: to.path,
          ...to.query
        }
      })
    }

    // 如果地址栏带了 token，且新旧 token 一致，则删除地址栏中的 token，路由正常跳转
    if (token === localToken) {
      // 如果 search 中存在 token，则删除之
      if (searchToken) {
        window.history.replaceState(null, null, window.location.pathname)
      }

      // 如果 hash 中存在 token，则删除之
      next({
        ...to,
        query: {
          ...to.query,
          [configs.tokenConfig.fieldName]: undefined
        }
      })
    }

    next()
  } else {
    // 验证进入登录页时是否存在token
    if (to.name === 'Login' && localToken) {
      if (searchToken) {
        window.history.replaceState(null, null, window.location.pathname)
      }

      if (!token && !cookieToken) {
        next({ name: 'Home' })
      }

      if (
        // 地址栏传递了新 token，以新 token 为准
        (token && token === localToken) ||
        // 处理某些第三方不通过地址栏传递 token，而通过 cookie 的方式传递 token 的情况
        (cookieToken && cookieToken === localToken)
      ) {
        const toRoute = { ...to }

        if (to.query.redirect) {
          toRoute.path = to.query.redirect
        } else {
          toRoute.name = 'Home'
        }

        toRoute.query.redirect = undefined
        toRoute.query[configs.tokenConfig.fieldName] = undefined

        next(toRoute)
      }
    }

    next()
  }
})

router.resetRouter = resetRouter

export { useRouter, resetRouter, getAbortController }

export default router
