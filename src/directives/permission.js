/**
 * 权限指令
 * v-permission="'admin'" - 需要 admin 权限
 * v-permission="['admin', 'user']" - 需要 admin 或 user 权限
 */

import { usePermission } from '@/composables/usePermission'

export default {
  mounted(el, binding) {
    const { hasRole, hasPermission } = usePermission()
    const value = binding.value
    
    let hasAccess = false
    
    // 如果是角色权限
    if (typeof value === 'string' || Array.isArray(value)) {
      hasAccess = hasRole(value)
    }
    
    // 如果是权限标识
    if (typeof value === 'string' && value.startsWith('permission:')) {
      const permission = value.replace('permission:', '')
      hasAccess = hasPermission(permission)
    }
    
    if (!hasAccess) {
      el.style.display = 'none'
      // 或者完全移除元素
      // el.parentNode?.removeChild(el)
    }
  },
  updated(el, binding) {
    // 权限更新时重新检查
    const { hasRole, hasPermission } = usePermission()
    const value = binding.value
    
    let hasAccess = false
    
    if (typeof value === 'string' || Array.isArray(value)) {
      hasAccess = hasRole(value)
    }
    
    if (typeof value === 'string' && value.startsWith('permission:')) {
      const permission = value.replace('permission:', '')
      hasAccess = hasPermission(permission)
    }
    
    el.style.display = hasAccess ? '' : 'none'
  }
}
