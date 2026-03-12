/**
 * 新闻管理相关 API
 */
import { get, post, put, del, handleResponse } from '../request'

/**
 * 创建新闻稿
 * @param {object} data - 新闻数据
 */
export function createNews(data) {
  return handleResponse(post('/news', data))
}

/**
 * 提交新闻稿
 * @param {number|string} id - 新闻ID
 */
export function submitNews(id) {
  return handleResponse(post(`/news/${id}/submit`))
}

/**
 * 审核新闻（学校管理员）
 * @param {number|string} id - 新闻ID
 * @param {object} data - 审核数据 { approvalStatus, reviewComment }
 */
export function reviewNews(id, data) {
  return handleResponse(post(`/news/${id}/review`, data))
}

/**
 * 分页查询新闻列表
 * @param {object} params - 查询参数 { pageNum, pageSize, title, status, approvalStatus, categoryId, authorId }
 */
export function getNews(params = {}) {
  const {
    pageNum = 1,
    pageSize = 10,
    title,
    status,
    approvalStatus,
    categoryId,
    authorId
  } = params
  
  return handleResponse(get('/news', {
    pageNum,
    pageSize,
    title,
    status, // 使用枚举值：DRAFT, PENDING, PUBLISHED, REJECTED
    approvalStatus, // 使用枚举值：PENDING, APPROVED, REJECTED
    categoryId,
    authorId
  }))
}

/**
 * 查询新闻详情
 * @param {number|string} id - 新闻ID
 */
export function getNewsById(id) {
  return handleResponse(get(`/news/${id}`))
}

/**
 * 更新新闻
 * @param {number|string} id - 新闻ID
 * @param {object} data - 新闻数据
 */
export function updateNews(id, data) {
  return handleResponse(put(`/news/${id}`, data))
}

/**
 * 删除新闻
 * @param {number|string} id - 新闻ID
 */
export function deleteNews(id) {
  return handleResponse(del(`/news/${id}`))
}
