import router from '@/router'

/**
 * 跳转到设计器
 * @param [name='Designer'] {string} - 路由名称，默认跳转到页面设计器
 * @param [params] {Object} - 路由参数
 * @param [query] {Object} - 路由query参数
 */
export function jumpToRoute({
    name = 'Designer',
    params,
    query
  } = {}
) {
  const newPage = router.resolve({
    name,
    params,
    query
  })

  window.open(newPage.href, '_blank')
}
