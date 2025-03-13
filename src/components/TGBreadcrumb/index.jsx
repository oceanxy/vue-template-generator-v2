import './index.scss'
import configs from '@/configs'
import { Breadcrumb } from 'ant-design-vue'
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

export default {
  name: 'TGBreadcrumb',
  setup() {
    const route = useRoute()

    const matchedRoutes = computed(() => {
      const matchedRoutes = [...route.matched]

      // 由于 '/' 路由的第一个子路由通常配置为首页的跳转路由，当进入首页时，route.matched 会将路由为 '/' 和 其第一个子路由
      // 同时返回，所以这里需要处理一下，以防面包屑显示为“首页 / 首页”的情况或类似情况。
      if (matchedRoutes.length === 2 && matchedRoutes[1].name === matchedRoutes[0].redirect.name) {
        matchedRoutes.shift()
      }

      // 处理面包屑出现最后两级重名的情况
      // 主要出现在父级菜单设置“hideChildren: true”（不在左侧菜单展示子级），同时子级路由的 path 字段为空字符串的情况
      const pathOfLastRoute = matchedRoutes[matchedRoutes.length - 1].path

      if (pathOfLastRoute.substring(pathOfLastRoute.length - 1) === '/') {
        matchedRoutes.pop()
      }

      // 替换面包屑第一级的名称
      // if (matchedRoutes[0]?.path === '') {
      //   matchedRoutes[0].meta.title = router.resolve({ name: matchedRoutes[0].redirect.name }).route.meta.title
      // }

      return matchedRoutes
    })

    function handleBreadcrumbName(route) {
      return route?.meta?.title ?? route.name
    }

    function itemRender({ route, routes }) {
      // 最后一项
      if (routes.indexOf(route) === routes.length - 1) {
        return (
          <span class={'tg-breadcrumb-last-title'}>
            {handleBreadcrumbName(route)}
          </span>
        )
      }

      return (
        <RouterLink to={route.key || '/'}>
          {handleBreadcrumbName(route)}
        </RouterLink>
      )
    }

    return () => (
      <div class={'tg-breadcrumb'}>
        <IconFont type={'icon-global-home'} class={'tg-breadcrumb-btn-home'} />
        <Breadcrumb
          routes={matchedRoutes.value}
          separator={configs.breadcrumbSeparator}
          itemRender={itemRender}
        />
      </div>
    )
  }
}
