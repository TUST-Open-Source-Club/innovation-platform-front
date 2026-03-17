import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi } from '@/api/modules/auth'
import { getToken, setToken, removeToken, getUser, setUser as setUserToStorage, removeUser } from '@/utils/storage'

export const useUserStore = defineStore('user', () => {
  // 从 localStorage 初始化，确保刷新后状态能恢复
  const token = ref(getToken() || '')
  const user = ref(getUser())

  const isLoggedIn = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || '')

  async function login(loginData) {
    try {
      const data = await loginApi(loginData.username, loginData.password)
      token.value = data.token
      user.value = data.user
      setToken(data.token)
      setUserToStorage(data.user)
      return data
    } catch (error) {
      throw error
    }
  }

  async function register(registerData) {
    try {
      const data = await registerApi(registerData)
      return data
    } catch (error) {
      throw error
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    removeToken()
    removeUser()
  }

  function setUser(userData) {
    user.value = userData
    // 同步更新到 localStorage
    if (userData) {
      setUserToStorage(userData)
    }
  }

  /**
   * 从 localStorage 同步恢复状态
   * 用于在应用启动时或需要时恢复用户状态
   */
  function restoreFromStorage() {
    const storedToken = getToken()
    const storedUser = getUser()

    if (storedToken) {
      token.value = storedToken
    }
    if (storedUser) {
      user.value = storedUser
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    userRole,
    login,
    register,
    logout,
    setUser,
    restoreFromStorage
  }
})
