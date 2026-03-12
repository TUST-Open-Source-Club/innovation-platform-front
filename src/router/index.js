import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

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
      
      // 其他路由
      // 注意：以下路由暂时注释，待实现对应组件后再启用
      // {
      //   path: 'review',
      //   name: 'Review',
      //   component: () => import('@/views/Review.vue'),
      //   meta: {
      //     title: '项目审核',
      //     requiresAuth: true,
      //     roles: ['COLLEGE_ADMIN', 'SCHOOL_ADMIN']
      //   }
      // },
      // {
      //   path: 'profile',
      //   name: 'Profile',
      //   component: () => import('@/views/profile/Profile.vue'),
      //   meta: {
      //     title: '个人中心',
      //     requiresAuth: true
      //   }
      // }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.token) {
    next('/login')
  } else if (to.meta.roles && userStore.user && !to.meta.roles.includes(userStore.user.role)) {
    // 仅当已加载用户信息且角色不匹配时重定向
    next('/dashboard')
  } else {
    next()
  }
})

export default router
