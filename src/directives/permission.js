/**
 * 权限指令
 * v-permission="'admin'" - 需要 admin 权限
 * v-permission="['admin', 'user']" - 需要 admin 或 user 权限
 */

import { getUser } from '@/utils/storage'

/**
 * 从 localStorage 获取当前用户角色
 * 不依赖 store，避免组件挂载时 store 未初始化的问题
 */
function getCurrentUserRole() {
  try {
    const user = getUser()
    return user?.role || ''
  } catch (e) {
    console.error('读取用户角色失败:', e)
    return ''
  }
}

/**
 * 检查是否有指定角色
 */
function hasRole(roles) {
  if (!Array.isArray(roles)) {
    roles = [roles]
  }
  const currentRole = getCurrentUserRole()
  return roles.includes(currentRole)
}

export default {
  mounted(el, binding) {
    const value = binding.value

    let hasAccess = false

    // 如果是角色权限
    if (typeof value === 'string' || Array.isArray(value)) {
      hasAccess = hasRole(value)
    }

    // 如果是权限标识
    if (typeof value === 'string' && value.startsWith('permission:')) {
      const permission = value.replace('permission:', '')
      // 权限功能待实现
      hasAccess = false
    }

    if (!hasAccess) {
      el.style.display = 'none'
    }
  },
  updated(el, binding) {
    const value = binding.value

    let hasAccess = false

    if (typeof value === 'string' || Array.isArray(value)) {
      hasAccess = hasRole(value)
    }

    if (typeof value === 'string' && value.startsWith('permission:')) {
      const permission = value.replace('permission:', '')
      hasAccess = false
    }

    el.style.display = hasAccess ? '' : 'none'
  }
}
