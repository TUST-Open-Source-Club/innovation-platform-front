import { get, post, put, del, handleResponse } from '../request'

/**
 * 项目相关 API
 */
export function getProjects(params = {}) {
  return handleResponse(get('/projects', params))
}

export function getProjectById(id) {
  return handleResponse(get(`/projects/${id}`))
}

export function createProject(data) {
  return handleResponse(post('/projects', data))
}

export function updateProject(id, data) {
  return handleResponse(put(`/projects/${id}`, data))
}

export function submitProject(id) {
  return handleResponse(post(`/projects/${id}/submit`))
}

export function reviewProject(id, data) {
  return handleResponse(post(`/projects/${id}/review`, data))
}

export function getMyProjects() {
  return handleResponse(get('/projects/my'))
}

/**
 * 根据团队ID获取关联的项目列表
 */
export function getProjectsByTeamId(teamId) {
  return handleResponse(get(`/teams/${teamId}/projects`))
}

/**
 * 无人接管项目列表（负责人虚位以待）
 */
export function getUnclaimedProjects() {
  return handleResponse(get('/projects/unclaimed'))
}

/**
 * 更换负责人（转给项目关联团队的成员）
 */
export function transferLeader(projectId, newLeaderUserId) {
  return handleResponse(post(`/projects/${projectId}/transfer-leader`, { newLeaderUserId }))
}

/**
 * 招募负责人（负责人虚位以待，项目进入无人接管列表）
 */
export function vacateLeader(projectId) {
  return handleResponse(post(`/projects/${projectId}/vacate-leader`))
}
