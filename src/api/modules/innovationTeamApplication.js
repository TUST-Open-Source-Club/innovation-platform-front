import { get, post, put, handleResponse } from '../request'

/**
 * 校企联合创新团队申请相关 API
 */
export function getInnovationTeamApplications(params = {}) {
  return handleResponse(get('/innovation-team-applications', params))
}

export function getInnovationTeamApplicationById(id) {
  return handleResponse(get(`/innovation-team-applications/${id}`))
}

export function createInnovationTeamApplication(data) {
  return handleResponse(post('/innovation-team-applications', data))
}

export function updateInnovationTeamApplication(id, data) {
  return handleResponse(put(`/innovation-team-applications/${id}`, data))
}

export function submitInnovationTeamApplication(id) {
  return handleResponse(post(`/innovation-team-applications/${id}/submit`))
}

export function getMyInnovationTeamApplications() {
  return handleResponse(get('/innovation-team-applications/my'))
}
