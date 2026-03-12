/**
 * 信息对接路由模块
 */
export default [
  {
    path: '/information-link',
    name: 'InformationLink',
    component: () => import('@/views/informationLink/index.vue'),
    meta: {
      title: '信息对接',
      requiresAuth: true
    }
  },
  {
    path: '/fund-applications',
    name: 'FundApplications',
    component: () => import('@/views/informationLink/fundApplications.vue'),
    meta: {
      title: '基金申请',
      requiresAuth: true
    }
  },
  {
    path: '/fund-applications/create',
    name: 'FundApplicationCreate',
    component: () => import('@/views/informationLink/fundApplicationForm.vue'),
    meta: {
      title: '创建基金申请',
      requiresAuth: true
    }
  },
  {
    path: '/fund-applications/:id/edit',
    name: 'FundApplicationEdit',
    component: () => import('@/views/informationLink/fundApplicationForm.vue'),
    meta: {
      title: '编辑基金申请',
      requiresAuth: true
    }
  },
  {
    path: '/fund-applications/:id',
    name: 'FundApplicationDetail',
    component: () => import('@/views/informationLink/fundApplicationDetail.vue'),
    meta: {
      title: '基金申请详情',
      requiresAuth: true
    }
  },
  {
    path: '/fund-applications/:id/review',
    name: 'FundApplicationReview',
    component: () => import('@/views/informationLink/fundApplicationReview.vue'),
    meta: {
      title: '基金申请审核',
      requiresAuth: true,
      roles: ['SCHOOL_ADMIN']
    }
  }
]
