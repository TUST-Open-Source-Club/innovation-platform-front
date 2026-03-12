/**
 * 入驻管理相关 API
 */
import { get, post, put, del, handleResponse } from '../request'

/**
 * 创建入驻申请
 * @param {object} data - 申请数据
 */
export function createEntryApplication(data) {
  return handleResponse(post('/entry-applications', data))
}

/**
 * 提交入驻申请
 * @param {number|string} id - 申请ID
 */
export function submitEntryApplication(id) {
  return handleResponse(post(`/entry-applications/${id}/submit`))
}

/**
 * 审核入驻申请（学校管理员）
 * @param {number|string} id - 申请ID
 * @param {object} data - 审核数据 { approvalStatus, reviewComment }
 */
export function reviewEntryApplication(id, data) {
  return handleResponse(post(`/entry-applications/${id}/review`, data))
}

/**
 * 确认入驻
 * @param {number|string} id - 申请ID
 */
export function confirmEntry(id) {
  return handleResponse(post(`/entry-applications/${id}/confirm-entry`))
}

/**
 * 退出入驻
 * @param {number|string} id - 申请ID
 * @param {object} data - 退出数据 { exitReason }
 */
export function exitEntry(id, data) {
  return handleResponse(post(`/entry-applications/${id}/exit`, data))
}

/**
 * 分页查询入驻申请列表
 * @param {object} params - 查询参数 { pageNum, pageSize, teamName, status, approvalStatus, applicationType, applicantId }
 */
export function getEntryApplications(params = {}) {
  const {
    pageNum = 1,
    pageSize = 10,
    teamName,
    status,
    approvalStatus,
    applicationType,
    applicantId
  } = params
  
  return handleResponse(get('/entry-applications', {
    pageNum,
    pageSize,
    teamName,
    status, // 使用枚举值：DRAFT, PENDING, APPROVED, REJECTED, ENTERED, EXITED
    approvalStatus, // 使用枚举值：PENDING, APPROVED, REJECTED
    applicationType,
    applicantId
  }))
}

/**
 * 查询入驻申请详情
 * @param {number|string} id - 申请ID
 */
export function getEntryApplicationById(id) {
  return handleResponse(get(`/entry-applications/${id}`))
}

/**
 * 更新入驻申请
 * @param {number|string} id - 申请ID
 * @param {object} data - 申请数据
 */
export function updateEntryApplication(id, data) {
  return handleResponse(put(`/entry-applications/${id}`, data))
}

/**
 * 删除入驻申请
 * @param {number|string} id - 申请ID
 */
export function deleteEntryApplication(id) {
  return handleResponse(del(`/entry-applications/${id}`))
}

/**
 * 查询我的入驻申请列表
 */
export function getMyApplications() {
  return handleResponse(get('/entry-applications/my'))
}
