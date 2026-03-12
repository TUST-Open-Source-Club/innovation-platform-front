/**
 * 统一的请求函数封装
 * 提供更便捷的 API 调用方式
 */

import api from './index'

/**
 * GET 请求
 * @param {string} url - 请求地址
 * @param {object} params - 查询参数
 * @param {object} config - axios 配置
 */
export function get(url, params = {}, config = {}) {
  return api.get(url, { params, ...config })
}

/**
 * POST 请求
 * @param {string} url - 请求地址
 * @param {object} data - 请求体数据
 * @param {object} config - axios 配置
 */
export function post(url, data = {}, config = {}) {
  return api.post(url, data, config)
}

/**
 * PUT 请求
 * @param {string} url - 请求地址
 * @param {object} data - 请求体数据
 * @param {object} config - axios 配置
 */
export function put(url, data = {}, config = {}) {
  return api.put(url, data, config)
}

/**
 * DELETE 请求
 * @param {string} url - 请求地址
 * @param {object} config - axios 配置
 */
export function del(url, config = {}) {
  return api.delete(url, config)
}

/**
 * PATCH 请求
 * @param {string} url - 请求地址
 * @param {object} data - 请求体数据
 * @param {object} config - axios 配置
 */
export function patch(url, data = {}, config = {}) {
  return api.patch(url, data, config)
}

/**
 * 统一响应处理
 * @param {Promise} promise - axios 请求 Promise
 * @returns {Promise} 处理后的 Promise，直接返回 data 数据
 */
export function handleResponse(promise) {
  return promise.then(response => {
    const { code, data, message } = response.data
    if (code === 200) {
      return data
    } else {
      return Promise.reject(new Error(message || '请求失败'))
    }
  })
}
