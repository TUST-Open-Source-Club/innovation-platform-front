import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi } from '@/api/modules/auth'
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '@/utils/storage'

export const useUserStore = defineStore('user', () => {
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
      setUser(data.user)
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
  }

  return {
    token,
    user,
    isLoggedIn,
    userRole,
    login,
    register,
    logout,
    setUser
  }
})
