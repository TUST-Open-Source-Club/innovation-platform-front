/**
 * 工具函数 - 格式化
 */
import dayjs from 'dayjs'

/**
 * 格式化日期时间
 */
export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '-'
  return dayjs(date).format(format)
}

/**
 * 格式化日期
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '-'
  return dayjs(date).format(format)
}

/**
 * 格式化时间（支持 LocalTime 格式如 "09:00:00"）
 */
export function formatTime(date, format = 'HH:mm') {
  if (!date) return '-'
  // 处理纯时间字符串如 "09:00:00"
  const str = String(date)
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
    const parts = str.split(':')
    return `${parts[0].padStart(2, '0')}:${parts[1]}`
  }
  return dayjs(date).format(format)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 格式化金额
 */
export function formatAmount(amount) {
  if (amount === null || amount === undefined) return '0.00'
  return Number(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
