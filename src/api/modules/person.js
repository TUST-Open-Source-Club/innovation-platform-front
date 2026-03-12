/**
 * 人员库相关 API
 */
import { get, post, put, del, handleResponse } from '../request'

/**
 * 获取人员列表
 * @param {object} params - 查询参数 { pageNum, pageSize, keyword, personTypeId, organization, status }
 */
export function getPersons(params = {}) {
  return handleResponse(get('/persons', params))
}

/**
 * 获取人员详情
 * @param {number|string} id - 人员 ID
 */
export function getPersonById(id) {
  return handleResponse(get(`/persons/${id}`))
}

/**
 * 创建人员
 * @param {object} data - 人员数据
 */
export function createPerson(data) {
  return handleResponse(post('/persons', data))
}

/**
 * 更新人员
 * @param {number|string} id - 人员 ID
 * @param {object} data - 更新的人员数据
 */
export function updatePerson(id, data) {
  return handleResponse(put(`/persons/${id}`, data))
}

/**
 * 删除人员
 * @param {number|string} id - 人员 ID
 */
export function deletePerson(id) {
  return handleResponse(del(`/persons/${id}`))
}

/**
 * 批量导入人员
 * @param {object} data - 导入数据 { file, ... }
 */
export function importPersons(data) {
  return handleResponse(post('/persons/import', data))
}

// ==================== 人员类型 ====================

/**
 * 获取人员类型列表
 */
export function getPersonTypes() {
  return handleResponse(get('/person-types'))
}
