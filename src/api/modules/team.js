import { get, post, put, del, handleResponse } from '../request'
import api from '../index'

/**
 * 团队相关 API
 */
export function getTeams(params = {}) {
  return handleResponse(get('/teams', params))
}

export function getTeamById(id) {
  return handleResponse(get(`/teams/${id}`))
}

export function createTeam(data) {
  return handleResponse(post('/teams', data))
}

export function updateTeam(id, data) {
  return handleResponse(put(`/teams/${id}`, data))
}

export function addTeamMember(teamId, userId) {
  return handleResponse(post(`/teams/${teamId}/members`, { userId }))
}

export function removeTeamMember(teamId, memberId) {
  return handleResponse(del(`/teams/${teamId}/members/${memberId}`))
}

export function getTeamMembers(teamId) {
  return handleResponse(get(`/teams/${teamId}/members`))
}

export function getMyTeams() {
  return handleResponse(get('/teams/my'))
}

/**
 * 检查用户是否是团队成员
 */
export function checkIsMember(teamId, userId) {
  return handleResponse(get(`/teams/${teamId}/members/check`, { userId }))
}

/**
 * 队长审批团队成员申请
 */
export function reviewMemberApplication(teamId, memberId, approvalStatus) {
  return handleResponse(post(`/teams/${teamId}/members/${memberId}/review`, { approvalStatus }))
}

/**
 * 获取待审批的成员申请列表
 */
export function getPendingApplications(teamId) {
  return handleResponse(get(`/teams/${teamId}/members/pending`))
}

/**
 * 获取所有团队成员（包括待审批的）
 */
export function getAllTeamMembers(teamId) {
  return handleResponse(get(`/teams/${teamId}/members/all`))
}

/**
 * 导出团队列表为 Excel（管理员），返回 Blob
 */
export function exportTeamsExcel() {
  return api.get('/teams/export', { responseType: 'blob' }).then(res => res.data)
}

/**
 * 上传 Excel 批量添加团队（管理员）
 */
export function importTeamsExcel(file) {
  const formData = new FormData()
  formData.append('file', file)
  return handleResponse(api.post('/teams/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }))
}
