/**
 * 人员库模块路由
 */
export default [
  {
    path: '/persons',
    name: 'Persons',
    component: () => import('@/views/person/index.vue'),
    meta: {
      title: '人员库',
      requiresAuth: true
    }
  }
]
