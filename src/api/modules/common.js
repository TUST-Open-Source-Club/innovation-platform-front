/**
 * 公共数据 API（新闻分类、空间类型等）
 */
import { get, handleResponse } from '../request'

/**
 * 获取新闻分类列表
 */
export function getNewsCategories() {
  return handleResponse(get('/news-categories'))
}

/**
 * 获取空间类型列表
 */
export function getSpaceTypes() {
  return handleResponse(get('/space-types'))
}

/**
 * 获取活动类型列表
 */
export function getActivityTypes() {
  return handleResponse(get('/activity-types'))
}

/**
 * 获取学院列表（用于主办单位、承办单位等）
 */
export function getColleges() {
  return handleResponse(get('/colleges'))
}
