import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getToken, getUser } from '@/utils/storage'

// 路由模块
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
import userRoutes from './modules/user'

const routes = [
  ...authRoutes,

  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      ...dashboardRoutes,
      ...projectRoutes,
      ...teamRoutes,
      ...spaceRoutes,
      ...activityRoutes,
      ...personRoutes,
      ...informationLinkRoutes,
      ...newsRoutes,
      ...entryApplicationRoutes,
      ...adminRoutes,

      // 个人中心
      ...userRoutes,
    ]
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 白名单：不需要登录即可访问的路径
const whiteList = ['/login', '/register', '/login-error', '/cas-callback', '/cas-merge']

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 1. 先从本地恢复登录态（刷新必执行）
  if (!userStore.token) {
    const token = getToken()
    if (token) {
      userStore.token = token
      const userInfo = getUser()
      if (userInfo) {
        userStore.setUser(userInfo)
      }
    }
  }

  const isLogin = !!userStore.token
  const user = userStore.user
  const userRole = user?.role

  // 2. 在白名单
  if (whiteList.includes(to.path)) {
    if (isLogin) {
      // 已登录还想去登录/注册 → 检查是否需要完善资料
      if (user && !user.isProfileComplete && to.path !== '/complete-profile') {
        next('/complete-profile')
      } else {
        next('/dashboard')
      }
    } else {
      next()
    }
    return
  }

  // 3. 需要完善资料的特殊处理：已登录但资料未完善的用户，只能访问 complete-profile
  if (isLogin && user && !user.isProfileComplete && to.path !== '/complete-profile') {
    next('/complete-profile')
    return
  }

  // 4. 需要登录但未登录
  if (to.meta.requiresAuth && !isLogin) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 5. 角色权限判断
  if (to.meta.roles?.length && userRole) {
    const hasPermission = to.meta.roles.includes(userRole)
    if (!hasPermission) {
      next('/dashboard')
      return
    }
  }

  // 正常放行
  next()
})

export default router