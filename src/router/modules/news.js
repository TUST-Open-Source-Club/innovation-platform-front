/**
 * 新闻管理路由模块
 */
export default [
  {
    path: '/news',
    name: 'News',
    component: () => import('@/views/news/index.vue'),
    meta: {
      title: '新闻中心',
      requiresAuth: true
    }
  },
  {
    path: '/news/create',
    name: 'NewsCreate',
    component: () => import('@/views/news/form.vue'),
    meta: {
      title: '发布新闻',
      requiresAuth: true,
      roles: ['COLLEGE_ADMIN', 'SCHOOL_ADMIN']
    }
  },
  {
    path: '/news/review',
    name: 'NewsReview',
    component: () => import('@/views/news/review.vue'),
    meta: {
      title: '新闻审核',
      requiresAuth: true,
      roles: ['SCHOOL_ADMIN']
    }
  },
  {
    path: '/news/:id/edit',
    name: 'NewsEdit',
    component: () => import('@/views/news/form.vue'),
    meta: {
      title: '编辑新闻',
      requiresAuth: true,
      roles: ['COLLEGE_ADMIN', 'SCHOOL_ADMIN']
    }
  },
  {
    path: '/news/:id',
    name: 'NewsDetail',
    component: () => import('@/views/news/detail.vue'),
    meta: {
      title: '新闻详情',
      requiresAuth: true
    }
  }
]
