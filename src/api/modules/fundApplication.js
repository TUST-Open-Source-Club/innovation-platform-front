import { get, post, handleResponse } from '../request'

/**
 * 基金申请相关 API
 */
export function getFundApplications(params = {}) {
  return handleResponse(get('/fund-applications', params))
}

export function getFundApplicationById(id) {
  return handleResponse(get(`/fund-applications/${id}`))
}

export function getMyFundApplications() {
  return handleResponse(get('/fund-applications/my'))
}

export function createFundApplication(data) {
  return handleResponse(post('/fund-applications', data))
}

export function submitFundApplication(id) {
  return handleResponse(post(`/fund-applications/${id}/submit`))
}

export function reviewFundApplication(id, data) {
  return handleResponse(post(`/fund-applications/${id}/review`, data))
}

/**
 * 基金类型相关 API
 */
export function getFundTypes() {
  return handleResponse(get('/fund-types'))
}
