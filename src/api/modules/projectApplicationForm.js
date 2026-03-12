import { get, post, put, handleResponse } from '../request'

/**
 * 项目申请表单相关 API
 */
export function getProjectApplicationForms(params = {}) {
  return handleResponse(get('/project-application-forms', params))
}

export function getProjectApplicationFormById(id) {
  return handleResponse(get(`/project-application-forms/${id}`))
}

export function createProjectApplicationForm(data) {
  return handleResponse(post('/project-application-forms', data))
}

export function updateProjectApplicationForm(id, data) {
  return handleResponse(put(`/project-application-forms/${id}`, data))
}

export function submitProjectApplicationForm(id) {
  return handleResponse(post(`/project-application-forms/${id}/submit`))
}

export function getMyProjectApplicationForms() {
  return handleResponse(get('/project-application-forms/my'))
}
