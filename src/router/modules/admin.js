/**
 * 管理员审核中心路由
 * 整合空间预约、入驻申请、新闻、项目审核
 */
export default [
  {
    path: '/admin/review',
    name: 'AdminReview',
    component: () => import('@/views/admin/review.vue'),
    meta: {
      title: '审核中心',
      requiresAuth: true,
      roles: ['COLLEGE_ADMIN', 'SCHOOL_ADMIN']
    }
  }
]
