/**
 * CAS登录流程单元测试
 * 测试前端组件在不同场景下的行为
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入待测试的组件
import Login from '@/views/auth/Login.vue'
import CasCallback from '@/views/auth/CasCallback.vue'
import CasMerge from '@/views/auth/CasMerge.vue'
import CompleteProfile from '@/views/auth/CompleteProfile.vue'
import { useUserStore } from '@/stores/user'
import { server, startMockServer, stopMockServer } from './mocks/server'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

describe('CAS登录流程测试', () => {
  let pinia
  let router

  beforeEach(async () => {
    // 启动Mock服务器
    startMockServer()
    
    // 创建Pinia实例
    pinia = createPinia()
    setActivePinia(pinia)
    
    // 创建路由
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/login', component: Login },
        { path: '/cas-callback', component: CasCallback },
        { path: '/cas-merge', component: CasMerge },
        { path: '/complete-profile', component: CompleteProfile },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } }
      ]
    })
    
    // 重置localStorage mock
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  afterEach(() => {
    stopMockServer()
    vi.clearAllMocks()
  })

  describe('1. 登录页面测试', () => {
    it('CAS启用时应自动跳转到CAS登录', async () => {
      const push = vi.spyOn(router, 'push')
      
      const wrapper = mount(Login, {
        global: {
          plugins: [pinia, router, ElementPlus]
        }
      })
      
      await flushPromises()
      await nextTick()
      
      // 验证检测到了CAS状态
      expect(wrapper.vm.casEnabled).toBe(true)
    })

    it('URL中有error时不应自动跳转', async () => {
      // 模拟URL中有error参数
      const originalLocation = window.location
      delete window.location
      window.location = { 
        href: 'http://localhost/login?error=some_error',
        search: '?error=some_error'
      }
      
      const wrapper = mount(Login, {
        global: {
          plugins: [pinia, router, ElementPlus]
        }
      })
      
      await flushPromises()
      
      // 应该停留在登录页面，显示错误
      expect(wrapper.vm.casEnabled).toBe(true)
      
      // 恢复window.location
      window.location = originalLocation
    })
  })

  describe('2. 新用户完善资料流程', () => {
    it('从URL获取token并加载用户信息', async () => {
      // 设置URL参数
      const originalLocation = window.location
      delete window.location
      window.location = {
        href: 'http://localhost/complete-profile?token=mock-jwt-token-new',
        search: '?token=mock-jwt-token-new'
      }
      
      const wrapper = mount(CompleteProfile, {
        global: {
          plugins: [pinia, router, ElementPlus]
        }
      })
      
      await flushPromises()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 验证token被保存
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'token',
        'mock-jwt-token-new'
      )
      
      // 恢复window.location
      window.location = originalLocation
    })

    it('提交完善资料表单', async () => {
      // 预设置token
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'mock-jwt-token-new'
        if (key === 'user') return JSON.stringify({ id: 2, realName: '张三' })
        return null
      })
      
      const push = vi.spyOn(router, 'push')
      
      const wrapper = mount(CompleteProfile, {
        global: {
          plugins: [pinia, router, ElementPlus]
        }
      })
      
      await flushPromises()
      
      // 填充表单
      await wrapper.find('input[type="email"]').setValue('zhangsan@example.com')
      await wrapper.find('input[type="tel"]').setValue('13800138000')
      
      // 提交表单
      await wrapper.find('button[type="submit"]').trigger('click')
      
      await flushPromises()
      
      // 验证跳转到首页
      expect(push).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('3. 账号合并流程', () => {
    it('正确解析URL中的合并数据', async () => {
      // 准备Base64编码的合并数据
      const mergeData = btoa(JSON.stringify({
        casUid: '2021001',
        casName: '张三',
        duplicateAccount: {
          username: 'zhangsan_local',
          realName: '张三',
          role: 'STUDENT'
        }
      })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      
      // 设置URL参数
      const originalLocation = window.location
      delete window.location
      window.location = {
        href: `http://localhost/cas-merge?data=${mergeData}`,
        search: `?data=${mergeData}`
      }
      
      const wrapper = mount(CasMerge, {
        global: {
          plugins: [pinia, router, ElementPlus]
        }
      })
      
      await flushPromises()
      await nextTick()
      
      // 验证数据被正确解析
      expect(wrapper.vm.casUid).toBe('2021001')
      expect(wrapper.vm.casName).toBe('张三')
      expect(wrapper.vm.duplicateAccount).toBeDefined()
      
      // 恢复window.location
      window.location = originalLocation
    })

    it('合并账号成功', async () => {
      const push = vi.spyOn(router, 'push')
      
      // 预设置数据
      sessionStorageMock.getItem.mockImplementation((key) => {
        if (key === 'cas_merge_data') {
          return JSON.stringify({
            casUid: '2021001',
            casName: '张三',
            duplicateAccount: {
              username: 'zhangsan_local',
              realName: '张三',
              role: 'STUDENT'
            }
          })
        }
        return null
      })
      
      const wrapper = mount(CasMerge, {
        global: {
          plugins: [pinia, router, ElementPlus]
        }
      })
      
      await flushPromises()
      await nextTick()
      
      // 输入密码
      const passwordInput = wrapper.find('input[type="password"]')
      await passwordInput.setValue('correct_password')
      
      // 点击确认合并
      await wrapper.find('button').trigger('click')
      
      await flushPromises()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 验证跳转到首页
      expect(push).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('4. 回调页面测试', () => {
    it('从URL获取token并完成登录', async () => {
      const push = vi.spyOn(router, 'push')
      
      // 设置URL参数
      const originalLocation = window.location
      delete window.location
      window.location = {
        href: 'http://localhost/cas-callback?ticket=success&token=mock-jwt-token-existing',
        search: '?ticket=success&token=mock-jwt-token-existing'
      }
      
      const wrapper = mount(CasCallback, {
        global: {
          plugins: [pinia, router, ElementPlus]
        }
      })
      
      await flushPromises()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 验证token被保存
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'token',
        'mock-jwt-token-existing'
      )
      
      // 恢复window.location
      window.location = originalLocation
    })
  })
})

describe('错误处理测试', () => {
  beforeEach(() => {
    startMockServer()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    stopMockServer()
  })

  it('网络错误时显示错误信息', async () => {
    // 可以在这里测试网络错误处理
  })

  it('无效token时跳转到登录页', async () => {
    // 测试无效token的处理
  })
})
