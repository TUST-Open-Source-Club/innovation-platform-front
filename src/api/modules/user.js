/**
 * 用户相关 API
 */
import { get, put, handleResponse } from '../request'

/**
 * 获取用户列表
 * @param {object} params - 查询参数
 */
export function getUsers(params = {}) {
  return handleResponse(get('/users', params))
}

/**
 * 获取用户详情
 * @param {number|string} id - 用户 ID
 */
export function getUserById(id) {
  return handleResponse(get(`/users/${id}`))
}

/**
 * 更新用户信息
 * @param {number|string} id - 用户 ID
 * @param {object} data - 更新的用户数据
 */
export function updateUser(id, data) {
  return handleResponse(put(`/users/${id}`, data))
}

/**
 * 更新当前用户信息
 * @param {object} data - 更新的用户数据
 */
export function updateCurrentUser(data) {
  return handleResponse(put('/users/me', data))
}

/**
 * 修改密码
 * @param {object} data - { oldPassword, newPassword }
 */
export function changePassword(data) {
  return handleResponse(put('/users/me/password', data))
}
