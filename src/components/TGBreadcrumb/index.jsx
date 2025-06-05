import './index.scss'
import configs from '@/configs'
import { Breadcrumb } from 'ant-design-vue'
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'
import router from '@/router'

export default {
  name: 'TGBreadcrumb',
  setup() {
    const route = useRoute()

    const matchedRoutes = computed(() => {
      const matchedRoutes = route.matched.map(route => ({
        ...router.resolve(route),
        children: []
      }))

      // 处理面包屑出现最后两级重名的情况
      // 主要出现在父级菜单设置“hideChildren: true”（不在左侧菜单展示子级），同时子级路由的 path 字段为空字符串的情况
      if (
        matchedRoutes.at(-1).path.at(-1) === '/' ||
        matchedRoutes.at(-2).path === matchedRoutes.at(-1).path
      ) {
        matchedRoutes.splice(-2, 1)
      }

      // 移除隐藏了子级的路由，避免该级面包屑出现下拉菜单
      matchedRoutes.forEach(route => {
        if (route.meta?.hideChildren) {
          route.children = []
        }
      })

      // 替换面包屑第一级的名称
      if (matchedRoutes[0]?.path === '') {
        matchedRoutes[0].meta.title = router.resolve({ name: matchedRoutes[0].redirect.name }).meta.title
      }

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
        <RouterLink to={route.path || '/'}>
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
