export default [
  {
    path: 'console',
    name: 'Console',
    component: () => import('@/apps/demo/views/Console'),
    meta: {
      title: '控制台',
      requiresAuth: true,
      hideBreadCrumb: true,
      icon: 'icon-menu-console'
    }
  },
  {
    path: 'accounts',
    name: 'Accounts',
    component: () => import('@/apps/demo/views/Accounts'),
    meta: {
      title: '账户管理',
      requiresAuth: true,
      icon: 'icon-menu-accounts'
    }
  },
  {
    path: 'designer',
    name: 'Designer',
    component: () => import('@/apps/demo/views/Designer'),
    meta: {
      title: '在线页面设计器',
      requiresAuth: true,
      icon: 'icon-menu-designer'
    }
  }
]
