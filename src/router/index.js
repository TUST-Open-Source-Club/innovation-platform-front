import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getUser, getToken } from '@/utils/storage'

// 导入路由模块
import authRoutes from './modules/auth'
import dashboardRoutes from './modules/dashboard'
import projectRoutes from './modules/project'
import teamRoutes from './modules/team'
import spaceRoutes from './modules/space'
import activityRoutes from './modules/activity'
import personRoutes from './modules/person'
import informationLinkRoutes from './modules/informationLink'
import newsRoutes from './modules/news'
import entryApplicationRoutes from './modules/entryApplication'
import adminRoutes from './modules/admin'

const routes = [
  // 认证路由（不需要布局）
  ...authRoutes,

  // 主应用路由（需要布局）
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      // 仪表盘
      ...dashboardRoutes,

      // 项目管理
      ...projectRoutes,

      // 团队管理
      ...teamRoutes,

      // 空间预约
      ...spaceRoutes,

      // 活动管理
      ...activityRoutes,

      // 人员库
      ...personRoutes,

      // 信息对接
      ...informationLinkRoutes,

      // 新闻管理
      ...newsRoutes,

      // 入驻审核、已入驻团队（管理员入口，团队管理主入口为 /teams）
      ...entryApplicationRoutes,

      // 审核中心（整合四类审核）
      ...adminRoutes,
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 检查用户是否已登录
 * 优先检查 store，如果没有则检查 localStorage（解决刷新后状态丢失问题）
 */
function isLoggedIn() {
  const userStore = useUserStore()
  // 优先从 store 检查
  if (userStore.token) {
    return true
  }
  // store 中没有，从 localStorage 检查
  const token = getToken()
  if (token) {
    // 同步恢复到 store，确保后续判断正常
    userStore.token = token
    const storedUser = getUser()
    if (storedUser) {
      userStore.setUser(storedUser)
    }
    return true
  }
  return false
}

/**
 * 获取当前用户角色
 * 优先从 store 获取，如果没有则从 localStorage 获取
 */
function getCurrentUserRole() {
  const userStore = useUserStore()
  if (userStore.user?.role) {
    return userStore.user.role
  }
  // 如果 store 中没有，尝试从 localStorage 读取
  const storedUser = getUser()
  return storedUser?.role || null
}

// 白名单：不需要登录就能访问的页面
const whiteList = ['/login', '/register'] 

router.beforeEach((to, from, next) => {
  // 白名单页面直接放行
  if (whiteList.includes(to.path)) {
    next()
    return
  }

  // 需要登录但未登录，跳转到登录页，并携带当前页面路径，登录后可跳转回来
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next({ 
      path: '/login', 
      query: { redirect: to.fullPath } // 记录要跳转的页面
    })
    return
  }

  // 已登录用户访问登录页，重定向到首页
  if (to.path === '/login' && isLoggedIn()) {
    next('/dashboard')
    return
  }

  // 需要特定角色的路由，检查角色权限
  if (to.meta.roles && to.meta.roles.length > 0) {
    const currentRole = getCurrentUserRole()

    // 如果有角色信息但不匹配，重定向到首页
    if (currentRole && !to.meta.roles.includes(currentRole)) {
      next('/dashboard')
      return
    }
  }

  next()
})

export default router