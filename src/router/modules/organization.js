/**
 * 组织管理模块路由
 */
export default [
  {
    path: '/organizations',
    name: 'Organizations',
    component: () => import('@/views/organization/index.vue'),
    meta: {
      title: '组织管理',
      requiresAuth: true
    }
  }
]
