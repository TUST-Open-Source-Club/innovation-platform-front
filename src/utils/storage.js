/**
 * 本地存储工具
 */

const storage = {
  /**
   * 设置存储
   * @param {string} key - 键名
   * @param {any} value - 值
   * @param {string} type - 存储类型 'localStorage' | 'sessionStorage'
   */
  set(key, value, type = 'localStorage') {
    const storage = window[type]
    try {
      storage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('存储失败:', error)
    }
  },

  /**
   * 获取存储
   * @param {string} key - 键名
   * @param {any} defaultValue - 默认值
   * @param {string} type - 存储类型
   * @returns {any}
   */
  get(key, defaultValue = null, type = 'localStorage') {
    const storage = window[type]
    try {
      const value = storage.getItem(key)
      return value ? JSON.parse(value) : defaultValue
    } catch (error) {
      console.error('读取存储失败:', error)
      return defaultValue
    }
  },

  /**
   * 删除存储
   * @param {string} key - 键名
   * @param {string} type - 存储类型
   */
  remove(key, type = 'localStorage') {
    const storage = window[type]
    storage.removeItem(key)
  },

  /**
   * 清空存储
   * @param {string} type - 存储类型
   */
  clear(type = 'localStorage') {
    const storage = window[type]
    storage.clear()
  },

  /**
   * 设置本地存储
   */
  setLocal(key, value) {
    this.set(key, value, 'localStorage')
  },

  /**
   * 获取本地存储
   */
  getLocal(key, defaultValue = null) {
    return this.get(key, defaultValue, 'localStorage')
  },

  /**
   * 设置会话存储
   */
  setSession(key, value) {
    this.set(key, value, 'sessionStorage')
  },

  /**
   * 获取会话存储
   */
  getSession(key, defaultValue = null) {
    return this.get(key, defaultValue, 'sessionStorage')
  }
}

// Token 相关工具函数
export const TOKEN_KEY = 'token'
export const USER_KEY = 'user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getUser() {
  try {
    const str = localStorage.getItem(USER_KEY)
    return str ? JSON.parse(str) : null
  } catch {
    return null
  }
}

export function setUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

export function removeUser() {
  localStorage.removeItem(USER_KEY)
}

export default storage
