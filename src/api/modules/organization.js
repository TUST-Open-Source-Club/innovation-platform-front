/**
 * 组织相关 API
 */
import { get, post, put, del, handleResponse } from '../request'

/**
 * 获取组织列表
 * @param {object} params - 查询参数 { pageNum, pageSize, keyword, organizationTypeId, status }
 */
export function getOrganizations(params = {}) {
  return handleResponse(get('/organizations', params))
}

/**
 * 获取组织详情
 * @param {number|string} id - 组织 ID
 */
export function getOrganizationById(id) {
  return handleResponse(get(`/organizations/${id}`))
}

/**
 * 创建组织
 * @param {object} data - 组织数据
 */
export function createOrganization(data) {
  return handleResponse(post('/organizations', data))
}

/**
 * 更新组织
 * @param {number|string} id - 组织 ID
 * @param {object} data - 更新的组织数据
 */
export function updateOrganization(id, data) {
  return handleResponse(put(`/organizations/${id}`, data))
}

/**
 * 删除组织
 * @param {number|string} id - 组织 ID
 */
export function deleteOrganization(id) {
  return handleResponse(del(`/organizations/${id}`))
}

// ==================== 组织成员 ====================

/**
 * 获取组织成员列表
 * @param {number|string} organizationId - 组织 ID
 */
export function getOrganizationMembers(organizationId) {
  return handleResponse(get(`/organizations/${organizationId}/members`))
}

/**
 * 添加组织成员
 * @param {number|string} organizationId - 组织 ID
 * @param {object} data - 成员数据 { userId, role, position, joinDate }
 */
export function addOrganizationMember(organizationId, data) {
  return handleResponse(post(`/organizations/${organizationId}/members`, data))
}

/**
 * 更新组织成员
 * @param {number|string} organizationId - 组织 ID
 * @param {number|string} memberId - 成员 ID
 * @param {object} data - 更新的成员数据
 */
export function updateOrganizationMember(organizationId, memberId, data) {
  return handleResponse(put(`/organizations/${organizationId}/members/${memberId}`, data))
}

/**
 * 移除组织成员
 * @param {number|string} organizationId - 组织 ID
 * @param {number|string} memberId - 成员 ID
 */
export function removeOrganizationMember(organizationId, memberId) {
  return handleResponse(del(`/organizations/${organizationId}/members/${memberId}`))
}

// ==================== 组织类型 ====================

/**
 * 获取组织类型列表
 */
export function getOrganizationTypes() {
  return handleResponse(get('/organization-types'))
}
