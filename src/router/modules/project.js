/**
 * 项目模块路由
 */
export default [
  {
    path: '/projects/review',
    name: 'ProjectReview',
    component: () => import('@/views/project/review.vue'),
    meta: {
      title: '项目审核',
      requiresAuth: true,
      roles: ['COLLEGE_ADMIN', 'SCHOOL_ADMIN']
    }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/views/project/index.vue'),
    meta: {
      title: '项目管理',
      requiresAuth: true
    }
  },
  {
    path: '/projects/create',
    name: 'ProjectCreate',
    component: () => import('@/views/project/form.vue'),
    meta: {
      title: '创建项目',
      requiresAuth: true
    }
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: () => import('@/views/project/detail.vue'),
    meta: {
      title: '项目详情',
      requiresAuth: true
    }
  },
  {
    path: '/projects/:id/edit',
    name: 'ProjectEdit',
    component: () => import('@/views/project/form.vue'),
    meta: {
      title: '编辑项目',
      requiresAuth: true
    }
  }
]
