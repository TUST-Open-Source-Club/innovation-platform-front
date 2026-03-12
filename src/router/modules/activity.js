/**
 * 活动管理路由模块
 */
export default [
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('@/views/activity/index.vue'),
    meta: {
      title: '活动管理',
      requiresAuth: true
    }
  },
  {
    path: '/activities/create',
    name: 'ActivityCreate',
    component: () => import('@/views/activity/form.vue'),
    meta: {
      title: '创建活动',
      requiresAuth: true
    }
  },
  {
    path: '/activities/:id',
    name: 'ActivityDetail',
    component: () => import('@/views/activity/detail.vue'),
    meta: {
      title: '活动详情',
      requiresAuth: true
    }
  },
  {
    path: '/activities/:id/edit',
    name: 'ActivityEdit',
    component: () => import('@/views/activity/form.vue'),
    meta: {
      title: '编辑活动',
      requiresAuth: true
    }
  },
  {
    path: '/activities/:id/summary',
    name: 'ActivitySummary',
    component: () => import('@/views/activity/summary.vue'),
    meta: {
      title: '活动总结',
      requiresAuth: true
    }
  },
  {
    path: '/activities/review',
    name: 'ActivityReview',
    component: () => import('@/views/activity/review.vue'),
    meta: {
      title: '活动审批',
      requiresAuth: true,
      roles: ['COLLEGE_ADMIN', 'SCHOOL_ADMIN']
    }
  }
]
