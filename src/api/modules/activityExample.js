/**
 * 前端 API 调用示例
 * 统一接口规范
 */

import { get, post, put, del, handleResponse } from '../request'

/**
 * 示例1：查询列表接口（分页）
 * GET /api/activities?pageNum=1&pageSize=10&keyword=xxx&status=PUBLISHED
 * 
 * 返回格式：
 * {
 *   "code": 200,
 *   "message": "操作成功",
 *   "data": {
 *     "pageNum": 1,
 *     "pageSize": 10,
 *     "total": 100,
 *     "totalPages": 10,
 *     "list": [...]
 *   }
 * }
 */
export function getActivities(params = {}) {
  const {
    pageNum = 1,
    pageSize = 10,
    keyword,
    status,
    approvalStatus
  } = params
  
  return handleResponse(get('/activities', {
    pageNum,
    pageSize,
    keyword,
    status, // 使用枚举值：PUBLISHED, ONGOING, COMPLETED, DRAFT
    approvalStatus // 使用枚举值：APPROVED, REJECTED, PENDING
  }))
}

/**
 * 示例2：新增接口
 * POST /api/activities
 * 
 * 请求体：
 * {
 *   "title": "活动标题",
 *   "activityTypeId": 1,
 *   "startTime": "2024-01-01T10:00:00",
 *   "endTime": "2024-01-01T12:00:00",
 *   "location": "活动地点",
 *   "description": "活动描述",
 *   "maxParticipants": 50
 * }
 * 
 * 返回格式：
 * {
 *   "code": 200,
 *   "message": "活动创建成功",
 *   "data": {
 *     "id": 1,
 *     "title": "活动标题",
 *     ...
 *   }
 * }
 */
export function createActivity(data) {
  return handleResponse(post('/activities', {
    ...data,
    status: 'DRAFT', // 使用枚举值
    approvalStatus: 'PENDING' // 使用枚举值
  }))
}

/**
 * 示例3：审核接口
 * POST /api/activities/{id}/review
 * 
 * 请求体：
 * {
 *   "approvalStatus": "APPROVED",  // 使用枚举值：APPROVED, REJECTED
 *   "reviewComment": "审核意见"
 * }
 * 
 * 返回格式：
 * {
 *   "code": 200,
 *   "message": "审核完成",
 *   "data": {
 *     "id": 1,
 *     "approvalStatus": "APPROVED",
 *     ...
 *   }
 * }
 */
export function reviewActivity(id, data) {
  // 确保使用枚举值
  const { approvalStatus, reviewComment } = data
  
  // 验证状态值
  const validStatuses = ['APPROVED', 'REJECTED']
  if (!validStatuses.includes(approvalStatus)) {
    throw new Error('审批状态无效，必须为：APPROVED 或 REJECTED')
  }
  
  return handleResponse(post(`/activities/${id}/review`, {
    approvalStatus, // 使用枚举值
    reviewComment
  }))
}

/**
 * 查询单个详情
 * GET /api/activities/{id}
 */
export function getActivityById(id) {
  return handleResponse(get(`/activities/${id}`))
}

/**
 * 更新接口
 * PUT /api/activities/{id}
 */
export function updateActivity(id, data) {
  return handleResponse(put(`/activities/${id}`, data))
}

/**
 * 删除接口
 * DELETE /api/activities/{id}
 */
export function deleteActivity(id) {
  return handleResponse(del(`/activities/${id}`))
}
