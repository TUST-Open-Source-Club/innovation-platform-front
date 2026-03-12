import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        const userStore = useUserStore()
        userStore.logout()
        ElMessage.error('登录已过期，请重新登录')
        window.location.href = '/login'
      } else {
        const msg = data?.message || (status === 403 ? '无权限访问' : status === 404 ? '接口不存在' : status === 500 ? '服务器错误' : '请求失败')
        ElMessage.error(msg)
      }
    } else {
      ElMessage.error(error.code === 'ECONNABORTED' ? '请求超时，请检查网络' : '网络错误，请确保后端服务已启动(端口8080)')
    }
    return Promise.reject(error)
  }
)

export default api
