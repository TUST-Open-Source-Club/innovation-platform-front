/**
 * 仪表盘路由
 */
export default [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: '首页',
      requiresAuth: true
    }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import('@/views/auth/ChangePassword.vue'),
    meta: {
      title: '修改密码',
      requiresAuth: true
    }
  }
]
