/**
 * 团队模块路由（整合入驻申请：创建申请即入驻申请）
 */
export default [
  {
    path: '/teams',
    name: 'Teams',
    component: () => import('@/views/team/index.vue'),
    meta: {
      title: '团队管理',
      requiresAuth: true
    }
  },
  {
    path: '/teams/create',
    name: 'TeamCreate',
    component: () => import('@/views/entryApplication/form.vue'),
    meta: {
      title: '创建申请',
      requiresAuth: true
    }
  },
  {
    path: '/teams/:id/edit',
    name: 'TeamEdit',
    component: () => import('@/views/team/form.vue'),
    meta: {
      title: '编辑团队',
      requiresAuth: true
    }
  },
  {
    path: '/teams/:id',
    name: 'TeamDetail',
    component: () => import('@/views/team/detail.vue'),
    meta: {
      title: '团队详情',
      requiresAuth: true
    }
  }
]
