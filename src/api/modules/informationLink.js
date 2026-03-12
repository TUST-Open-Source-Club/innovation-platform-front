/**
 * 信息对接相关 API
 */
import { post, handleResponse } from '../request'

/**
 * 学生和教师申请加入团队（可提交个人信息与简历附件）
 * @param {number} teamId - 团队ID
 * @param {object} data - 申请信息 { realName, studentId, grade, major, competitionExperience, awards, contactPhone, resumeAttachment }
 */
export function applyJoinTeam(teamId, data = {}) {
  return handleResponse(post(`/information-link/teams/${teamId}/apply`, data))
}

/**
 * 教师申请接管无人管理项目
 */
export function applyTakeoverProject(projectId) {
  return handleResponse(post(`/information-link/projects/${projectId}/takeover`))
}

/**
 * 项目负责人发起基金申请
 */
export function createFundApplication(data) {
  return handleResponse(post('/information-link/fund-applications', data))
}

/**
 * 学校管理员审核基金申请
 */
export function reviewFundApplication(id, data) {
  return handleResponse(post(`/information-link/fund-applications/${id}/review`, data))
}

/**
 * 项目负责人招募成员
 */
export function recruitMember(projectId, userId) {
  return handleResponse(post(`/information-link/projects/${projectId}/recruit`, { userId }))
}
