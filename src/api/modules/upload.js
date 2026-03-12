/**
 * 文件上传 API
 */
import api from '../index'
import { handleResponse } from '../request'

/**
 * 上传文件（如简历附件、活动二维码等）
 * @param {File} file - 文件对象
 * @param {string} [dir='resume'] - 保存目录：resume | activity-qrcode | activity-poster
 * @returns {Promise<string>} 返回文件访问 URL 路径
 */
export function uploadFile(file, dir = 'resume') {
  const formData = new FormData()
  formData.append('file', file)
  return handleResponse(
    api.post('/upload', formData, {
      params: { dir },
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  )
}
