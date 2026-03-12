/**
 * 通用组合式函数 - 权限处理
 */
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export function usePermission() {
  const userStore = useUserStore()

  /**
   * 当前用户角色
   */
  const userRole = computed(() => userStore.user?.role || '')

  /**
   * 是否为管理员
   */
  const isAdmin = computed(() => {
    return userRole.value === 'COLLEGE_ADMIN' || userRole.value === 'SCHOOL_ADMIN'
  })

  /**
   * 是否为学校管理员
   */
  const isSchoolAdmin = computed(() => {
    return userRole.value === 'SCHOOL_ADMIN'
  })

  /**
   * 是否为学院管理员
   */
  const isCollegeAdmin = computed(() => {
    return userRole.value === 'COLLEGE_ADMIN'
  })

  /**
   * 是否为教师
   */
  const isTeacher = computed(() => {
    return userRole.value === 'TEACHER'
  })

  /**
   * 是否为学生
   */
  const isStudent = computed(() => {
    return userRole.value === 'STUDENT'
  })

  /**
   * 检查是否有指定角色
   */
  const hasRole = (roles) => {
    if (!Array.isArray(roles)) {
      roles = [roles]
    }
    return roles.includes(userRole.value)
  }

  /**
   * 检查是否有任一角色
   */
  const hasAnyRole = (roles) => {
    if (!Array.isArray(roles)) {
      roles = [roles]
    }
    return roles.some(role => role === userRole.value)
  }

  return {
    userRole,
    isAdmin,
    isSchoolAdmin,
    isCollegeAdmin,
    isTeacher,
    isStudent,
    hasRole,
    hasAnyRole
  }
}
