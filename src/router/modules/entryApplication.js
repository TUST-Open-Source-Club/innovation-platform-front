/**
 * 入驻管理路由模块
 */
export default [
  {
    path: '/entry-applications',
    name: 'EntryApplications',
    component: () => import('@/views/entryApplication/index.vue'),
    meta: {
      title: '入驻申请',
      requiresAuth: true
    }
  },
  {
    path: '/entry-applications/create',
    name: 'EntryApplicationCreate',
    component: () => import('@/views/entryApplication/form.vue'),
    meta: {
      title: '创建入驻申请',
      requiresAuth: true
    }
  },
  {
    path: '/entry-applications/:id/edit',
    name: 'EntryApplicationEdit',
    component: () => import('@/views/entryApplication/form.vue'),
    meta: {
      title: '编辑入驻申请',
      requiresAuth: true
    }
  },
  {
    path: '/entry-applications/:id',
    name: 'EntryApplicationDetail',
    component: () => import('@/views/entryApplication/form.vue'),
    meta: {
      title: '入驻申请详情',
      requiresAuth: true
    }
  },
  {
    path: '/entry-applications/review',
    name: 'EntryApplicationReview',
    component: () => import('@/views/entryApplication/review.vue'),
    meta: {
      title: '入驻审核',
      requiresAuth: true,
      roles: ['SCHOOL_ADMIN']
    }
  },
  {
    path: '/entry-teams',
    name: 'EntryTeams',
    component: () => import('@/views/entryApplication/teams.vue'),
    meta: {
      title: '已入驻团队',
      requiresAuth: true
    }
  }
]
