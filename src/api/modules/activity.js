/**
 * 活动管理相关 API
 */
import { get, post, put, del, handleResponse } from '../request'
import api from '../index'

/**
 * 创建活动申报
 */
export function createActivity(data) {
  return handleResponse(post('/activities', data))
}

/**
 * 提交活动申报
 */
export function submitActivity(id) {
  return handleResponse(post(`/activities/${id}/submit`))
}

/**
 * 学院管理员初审
 */
export function collegeReview(id, data) {
  return handleResponse(post(`/activities/${id}/college-review`, data))
}

/**
 * 学校管理员终审并发布
 */
export function schoolReview(id, data) {
  return handleResponse(post(`/activities/${id}/school-review`, data))
}

/**
 * 分页查询活动
 * @param {object} params - 查询参数 { pageNum, pageSize, keyword, status, approvalStatus, activityTypeId }
 */
export function getActivities(params = {}) {
  const {
    pageNum = 1,
    pageSize = 10,
    keyword,
    status,
    approvalStatus,
    activityTypeId
  } = params
  
  return handleResponse(get('/activities', {
    pageNum,
    pageSize,
    keyword,
    status, // 使用枚举值：PUBLISHED, ONGOING, COMPLETED, DRAFT
    approvalStatus, // 使用枚举值：APPROVED, REJECTED, PENDING
    activityTypeId
  }))
}

/**
 * 查询活动详情
 */
export function getActivityById(id) {
  return handleResponse(get(`/activities/${id}`))
}

/**
 * 更新活动
 */
export function updateActivity(id, data) {
  return handleResponse(put(`/activities/${id}`, data))
}

/**
 * 上传活动海报（仅管理员）
 */
export function uploadActivityPoster(id, file) {
  const formData = new FormData()
  formData.append('file', file)
  return handleResponse(
    api.post(`/activities/${id}/poster`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  )
}

/**
 * 活动报名
 */
export function registerActivity(id, data) {
  return handleResponse(post(`/activities/${id}/register`, data))
}

/**
 * 获取我报名的活动列表
 */
export function getMyRegistrations() {
  return handleResponse(get('/activities/my-registrations'))
}

/**
 * 取消报名
 */
export function cancelRegistration(id) {
  return handleResponse(del(`/activities/registrations/${id}`))
}

/**
 * 提交活动总结
 */
export function submitActivitySummary(id, data) {
  return handleResponse(post(`/activities/${id}/summary`, data))
}

/**
 * 根据活动ID获取总结（组织者/学院管理员，用于判断是否可提交或再提交）
 */
export function getActivitySummary(activityId) {
  return handleResponse(get(`/activities/${activityId}/summary`))
}

/**
 * 学院管理员：审批活动总结（通过/驳回）
 * @param {number} summaryId - 总结ID
 * @param {object} data - { approvalStatus: 'APPROVED'|'REJECTED', reviewComment?: string }
 */
export function reviewActivitySummary(summaryId, data) {
  return handleResponse(post(`/activities/summaries/${summaryId}/review`, data))
}

/**
 * 学院管理员：分页获取所有活动总结
 * @param {object} params - { pageNum, pageSize }
 */
export function getActivitySummaries(params = {}) {
  const { pageNum = 1, pageSize = 10 } = params
  return handleResponse(get('/activities/summaries', { pageNum, pageSize }))
}
