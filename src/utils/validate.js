/**
 * 验证工具函数
 */

/**
 * 验证邮箱
 * @param {string} email - 邮箱地址
 * @returns {boolean}
 */
export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * 验证手机号
 * @param {string} phone - 手机号
 * @returns {boolean}
 */
export function validatePhone(phone) {
  const regex = /^1[3-9]\d{9}$/
  return regex.test(phone)
}

/**
 * 验证身份证号
 * @param {string} idCard - 身份证号
 * @returns {boolean}
 */
export function validateIdCard(idCard) {
  const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return regex.test(idCard)
}

/**
 * 验证 URL
 * @param {string} url - URL 地址
 * @returns {boolean}
 */
export function validateUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证是否为空
 * @param {any} value - 值
 * @returns {boolean}
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  return false
}

/**
 * Element Plus 表单验证规则生成器
 */
export const rules = {
  /**
   * 必填验证
   * @param {string} message - 错误提示
   */
  required(message = '此项为必填项') {
    return { required: true, message, trigger: 'blur' }
  },

  /**
   * 邮箱验证
   */
  email() {
    return {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: 'blur'
    }
  },

  /**
   * 手机号验证
   */
  phone() {
    return {
      validator: (rule, value, callback) => {
        if (!value) {
          callback()
        } else if (!validatePhone(value)) {
          callback(new Error('请输入正确的手机号'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  },

  /**
   * URL 验证
   */
  url() {
    return {
      type: 'url',
      message: '请输入正确的 URL 地址',
      trigger: 'blur'
    }
  },

  /**
   * 长度验证
   * @param {number} min - 最小长度
   * @param {number} max - 最大长度
   */
  length(min, max) {
    return {
      min,
      max,
      message: `长度在 ${min} 到 ${max} 个字符`,
      trigger: 'blur'
    }
  }
}
