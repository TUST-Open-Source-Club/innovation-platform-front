/**
 * MSW (Mock Service Worker) 服务器配置
 * 用于测试时模拟后端API和CAS认证
 */
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock CAS票据验证
const casHandlers = [
  // 获取CAS状态
  http.get('/api/auth/cas/status', () => {
    return HttpResponse.json({
      code: 200,
      data: {
        enabled: true,
        mockMode: true,
        loginUrl: 'http://mock-cas-server/login'
      }
    })
  }),

  // CAS登录重定向（Mock模式）
  http.get('/api/auth/cas/login', () => {
    // 模拟重定向到回调页面
    return HttpResponse.json({
      code: 302,
      redirectUrl: '/cas-callback?ticket=MOCK-2021001-张三'
    })
  }),

  // 验证Mock ticket - 新用户场景
  http.get('/api/auth/cas/validate', ({ request }) => {
    const url = new URL(request.url)
    const ticket = url.searchParams.get('ticket')
    
    if (ticket?.startsWith('MOCK-NEW-')) {
      // 新用户 - 重定向到完善资料
      return HttpResponse.json({
        code: 302,
        redirectUrl: '/complete-profile?token=mock-jwt-token-new'
      })
    }
    
    if (ticket?.startsWith('MOCK-MERGE-')) {
      // 需要合并账号
      const mergeData = btoa(JSON.stringify({
        casUid: '2021001',
        casName: '张三',
        duplicateAccount: {
          username: 'zhangsan_local',
          realName: '张三',
          role: 'STUDENT'
        }
      })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      
      return HttpResponse.json({
        code: 302,
        redirectUrl: `/cas-merge?data=${mergeData}`
      })
    }
    
    if (ticket?.startsWith('MOCK-EXISTING-')) {
      // 已存在用户直接登录
      return HttpResponse.json({
        code: 302,
        redirectUrl: '/cas-callback?ticket=success&token=mock-jwt-token-existing'
      })
    }
    
    return HttpResponse.json({
      code: 400,
      message: 'Invalid ticket'
    }, { status: 400 })
  }),

  // 合并账号
  http.post('/api/auth/cas/merge', async ({ request }) => {
    const body = await request.json()
    
    if (body.password === 'correct_password') {
      return HttpResponse.json({
        code: 200,
        data: {
          token: 'mock-jwt-token-merged',
          user: {
            id: 1,
            username: 'zhangsan_local',
            realName: '张三',
            role: 'STUDENT',
            authType: 'BOTH',
            casUid: body.casUid
          },
          needCompleteProfile: false
        }
      })
    }
    
    return HttpResponse.json({
      code: 400,
      message: '密码错误'
    }, { status: 400 })
  }),

  // 创建新账号
  http.post('/api/auth/cas/create-new', ({ request }) => {
    return HttpResponse.json({
      code: 200,
      data: {
        token: 'mock-jwt-token-created',
        user: {
          id: 2,
          username: '2021001',
          realName: '张三',
          role: 'STUDENT',
          authType: 'CAS',
          casUid: '2021001'
        },
        needCompleteProfile: true
      }
    })
  }),

  // 完善资料
  http.post('/api/auth/cas/complete-profile', async ({ request }) => {
    const body = await request.json()
    
    return HttpResponse.json({
      code: 200,
      data: {
        message: '资料完善成功',
        profileComplete: true
      }
    })
  }),

  // 获取当前用户信息
  http.get('/api/users/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({
        code: 401,
        message: '未登录'
      }, { status: 401 })
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // 模拟不同token返回不同用户
    if (token.includes('new')) {
      return HttpResponse.json({
        code: 200,
        data: {
          id: 2,
          username: '2021001',
          realName: '张三',
          role: 'STUDENT',
          authType: 'CAS',
          casUid: '2021001',
          isProfileComplete: 0
        }
      })
    }
    
    return HttpResponse.json({
      code: 200,
      data: {
        id: 1,
        username: 'zhangsan_local',
        realName: '张三',
        role: 'STUDENT',
        authType: 'BOTH',
        casUid: '2021001',
        isProfileComplete: 1
      }
    })
  }),

  // 获取学院列表
  http.get('/api/colleges', () => {
    return HttpResponse.json({
      code: 200,
      data: [
        { id: 1, name: '计算机学院' },
        { id: 2, name: '电子工程学院' },
        { id: 3, name: '机械工程学院' }
      ]
    })
  })
]

export const server = setupServer(...casHandlers)

// 启动和停止辅助函数
export function startMockServer() {
  server.listen({ onUnhandledRequest: 'bypass' })
  console.log('[Mock Server] Started')
}

export function stopMockServer() {
  server.close()
  console.log('[Mock Server] Stopped')
}

export function resetMockServer() {
  server.resetHandlers()
}
