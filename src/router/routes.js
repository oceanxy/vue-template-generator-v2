/**
 * 路由。
 */

import configs from '@/configs'
import { getFirstLetterOfEachWordOfAppName } from '@/utils/utilityFunction'

/**
 * 获取基础路由数据
 * @param {import ('vue-router').RouteRecord[]} [routes]
 * @returns {import ('vue-router').RouteRecord[]}
 */
export default function getBaseRoutes(routes) {
  // const _config = configs
  const appName = getFirstLetterOfEachWordOfAppName()
  let rootRoutes
  const homePermissions = typeof configs.homePermissions === 'boolean' ? configs.homePermissions : true

  if (Array.isArray(routes) && routes.length) {
    // 查询子项目路由中是否存在静态路由，如果有就把静态路由插入到 rootRoutes 中
    __TG_APP_ROUTES__.staticRoutes?.forEach(staticRoute => {
      // 筛除重复的路由
      if (routes.findIndex(route => route.name === staticRoute.name) === -1) {
        routes.unshift(staticRoute)
      }
    })

    // 查找根路由
    const homeIndex = routes.findIndex(route => route.path === '/')

    // 检查路由数据是否包含根路由
    if (homeIndex > -1) {
      rootRoutes = routes
      rootRoutes[homeIndex] = {
        ...routes[homeIndex],
        name: 'Home',
        redirect: {
          name: configs.dynamicRouting
            ? localStorage.getItem(`${appName}-defaultRoute`) || configs.defaultRouteName
            : configs.defaultRouteName
        },
        meta: {
          ...routes[homeIndex].meta,
          requiresAuth: routes[homeIndex].meta.requiresAuth
        }
      }
    } else {
      // 当 Routes 不包含跟路由时，则直接将该 Routes 视为跟路由的 children
      rootRoutes = [
        {
          path: '/',
          name: 'Home',
          component: () => import('@/layouts/TGBackendSystem'),
          // component: resolve => require.ensure(
          //   [],
          //   () => resolve(require('@/layouts/' + _config.layout)),
          //   'chunk-home'
          // ),
          redirect: {
            name: configs.dynamicRouting
              ? localStorage.getItem(`${appName}-defaultRoute`) || configs.defaultRouteName
              : configs.defaultRouteName
          },
          children: routes,
          meta: {
            title: '后台',
            keepAlive: false,
            requiresAuth: homePermissions,
            // icon: () => import('@/assets/images/console.svg') // svg 图标方式
            icon: '' // icon-font symbol 方式
          }
        }
      ]
    }
  } else {
    // 当传递的 Vue.Routes 数据时不合法时
    rootRoutes = [
      {
        path: '/',
        name: 'Home',
        redirect: () => {
          // 登录状态下无可用菜单跳转到无权限页面
          if (localStorage.getItem(`${appName}-${configs.tokenConfig.fieldName}`)) {
            return { name: 'NoAccess', query: { 'no-link': 1 } }
          }

          // 未登录状态下跳转到登录页
          return { name: 'Login' }
        },
        meta: {
          title: '后台',
          keepAlive: false,
          requiresAuth: homePermissions,
          // icon: () => import('@/assets/images/console.svg') // svg 图标方式
          icon: '' // icon-font symbol 方式
        }
      }
    ]
  }

  return [
    {
      path: '/login',
      name: 'Login',
      component: () => Promise.resolve(__TG_APP_LOGIN_COMPONENT__),
      meta: {
        title: '登录',
        keep: false,
        requiresAuth: false
      }
    },
    ...rootRoutes,
    {
      path: '/no-access',
      name: 'NoAccess',
      component: () => import('@/views/NoAccess'),
      meta: {
        title: '无访问权限',
        keep: false,
        requiresAuth: false
      }
    },
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/views/NotFound'),
      meta: {
        title: '404',
        keep: false,
        requiresAuth: false
      }
    },
    {
      path: '/:catchAll(.*)',
      redirect: { name: 'NotFound' }
    }
  ]
}
