import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import permissionDirective from './directives/permission'
import { useUserStore } from './stores/user'
import { getToken, setUser } from './utils/storage'
import { getCurrentUser } from './api/modules/auth'

// 导入全局样式
import './styles/index.css'
import './styles/variables.css'

/**
 * 初始化用户状态（同步恢复 + 异步更新）
 * 关键：必须在 router 守卫执行前完成同步恢复
 */
function initUserState(pinia) {
  const token = getToken()

  if (token) {
    const userStore = useUserStore(pinia)

    // 同步恢复：从 localStorage 恢复到 store（确保 router 守卫和权限指令能正常工作）
    userStore.restoreFromStorage()

    // 异步更新：在后台获取最新用户信息
    getCurrentUser()
      .then(userData => {
        if (userData) {
          userStore.setUser(userData)
          setUser(userData) // 更新 localStorage
        }
      })
      .catch(error => {
        console.warn('从服务器获取用户信息失败，使用本地缓存:', error)
        // 如果 API 调用失败，localStorage 中的数据已经恢复到 store，不影响使用
      })
  }
}

function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()

  // 注册所有图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  // 注册自定义指令
  app.directive('permission', permissionDirective)

  app.use(pinia)

  // 关键修复：在 router 安装前同步恢复用户状态
  initUserState(pinia)

  app.use(router)
  app.use(ElementPlus, { locale: zhCn })

  app.mount('#app')
}

bootstrap()
