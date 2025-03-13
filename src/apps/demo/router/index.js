export default [
  {
    path: 'console',
    name: 'Console',
    component: () => import('@/apps/demo/views/Console'),
    meta: {
      title: '控制台',
      requiresAuth: true,
      hideBreadCrumb: true,
      icon: 'icon-global-home'
    }
  },
  {
    path: 'accounts',
    name: 'Accounts',
    component: () => import('@/apps/demo/views/Accounts'),
    meta: {
      title: '账户管理',
      requiresAuth: true,
      icon: 'icon-menu-xtgl'
    }
  }
]
