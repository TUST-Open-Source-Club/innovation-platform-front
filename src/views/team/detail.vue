<template>
  <div class="team-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>团队详情</span>
          <div>
            <el-button v-if="isLeader" type="primary" @click="goEdit">编辑团队</el-button>
            <el-button @click="goBack">返回</el-button>
          </div>
        </div>
      </template>

      <div v-if="loading" style="text-align: center; padding: 40px;">
        <el-icon class="is-loading"><Loading /></el-icon>
      </div>
      <div v-else-if="team">
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0;">{{ team.name }}</h3>
          <div>
            <el-button
              v-if="canJoinTeam"
              type="success"
              @click="openApplyDialog"
            >
              申请加入
            </el-button>
            <el-tag v-else-if="isMember" type="success" size="large">已加入</el-tag>
            <el-tag v-else-if="hasPendingApplication" type="warning" size="large">待审批</el-tag>
          </div>
        </div>
        <!-- 团队简介 -->
        <div class="detail-section">
          <div class="detail-section-title">团队简介</div>
          <div v-if="!isLeader || !editingDesc" class="detail-section-content">
            <div class="detail-desc-text">{{ team.description || '暂无简介' }}</div>
            <el-button v-if="isLeader && !editingDesc" type="primary" link size="small" @click="editingDesc = true">编辑</el-button>
          </div>
          <div v-else class="detail-section-edit">
            <el-input
              v-model="editDescription"
              type="textarea"
              :rows="4"
              placeholder="请输入团队简介"
            />
            <div class="detail-edit-actions">
              <el-button size="small" @click="cancelEditDesc">取消</el-button>
              <el-button type="primary" size="small" :loading="savingDesc" @click="saveDescription">保存</el-button>
            </div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="detail-section">
          <div class="detail-section-title">基本信息</div>
          <el-descriptions :column="2" border class="detail-descriptions">
            <el-descriptions-item label="团队名称">{{ team.name }}</el-descriptions-item>
            <el-descriptions-item label="团队类型">{{ team.teamType ? getTeamTypeText(team.teamType) : '—' }}</el-descriptions-item>
            <el-descriptions-item label="队长">{{ team.leaderName }}</el-descriptions-item>
            <el-descriptions-item label="负责人学号">{{ team.leaderStudentId || '—' }}</el-descriptions-item>
            <el-descriptions-item label="指导老师">{{ team.instructorName || '—' }}</el-descriptions-item>
            <el-descriptions-item label="学院">{{ team.collegeName || '—' }}</el-descriptions-item>
            <el-descriptions-item label="成员数量">{{ team.memberCount || 0 }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDateTime(team.createTime) }}</el-descriptions-item>
          </el-descriptions>
          <div v-if="isLeader" class="detail-section-edit">
            <el-button type="primary" link size="small" @click="editingExtra = true">编辑指导老师/负责人学号/学院/团队类型</el-button>
          </div>
          <el-dialog v-model="editingExtra" title="编辑其他信息" width="480px" append-to-body @open="syncExtraFromTeam">
            <el-form label-width="100px">
              <el-form-item label="团队类型">
                <el-select v-model="editTeamType" placeholder="选择团队类型" clearable style="width: 100%">
                  <el-option label="创新团队" value="INNOVATION" />
                  <el-option label="创业团队" value="STARTUP" />
                  <el-option label="科研团队" value="RESEARCH" />
                </el-select>
              </el-form-item>
              <el-form-item label="指导老师">
                <el-input v-model="editInstructorName" placeholder="请输入指导老师" />
              </el-form-item>
              <el-form-item label="负责人学号">
                <el-input v-model="editLeaderStudentId" placeholder="请输入负责人学号" />
              </el-form-item>
              <el-form-item label="学院">
                <el-input v-model="editCollegeName" placeholder="请输入学院名" />
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="editingExtra = false">取消</el-button>
              <el-button type="primary" :loading="savingExtra" @click="saveExtraInfo">保存</el-button>
            </template>
          </el-dialog>
        </div>

        <!-- 招募信息 -->
        <div class="detail-section">
          <div class="detail-section-title">招募信息</div>
          <el-descriptions :column="2" border class="detail-descriptions">
            <el-descriptions-item label="是否招募成员">
              <template v-if="isLeader">
                <el-switch
                  v-model="team.recruiting"
                  :active-value="true"
                  :inactive-value="false"
                  @change="handleRecruitingChange"
                />
                <span style="margin-left: 8px;">{{ team.recruiting !== false ? '正在招募' : '暂不招募' }}</span>
              </template>
              <template v-else>
                <el-tag :type="team.recruiting !== false ? 'success' : 'info'" size="small">
                  {{ team.recruiting !== false ? '正在招募' : '暂不招募' }}
                </el-tag>
              </template>
            </el-descriptions-item>
            <el-descriptions-item label="团队是否公开">
              <template v-if="isLeader">
                <el-switch
                  v-model="team.isPublic"
                  :active-value="true"
                  :inactive-value="false"
                  @change="handleIsPublicChange"
                />
                <span style="margin-left: 8px;">{{ team.isPublic !== false ? '公开' : '不公开' }}</span>
              </template>
              <template v-else>
                <el-tag :type="team.isPublic !== false ? 'success' : 'info'" size="small">
                  {{ team.isPublic !== false ? '公开' : '不公开' }}
                </el-tag>
              </template>
            </el-descriptions-item>
            <el-descriptions-item label="招募人员的要求" :span="2">
              <div v-if="!isLeader" class="detail-readonly-text">{{ team.recruitmentRequirement || '暂无' }}</div>
              <div v-else-if="!editingRecruit" class="detail-section-content">
                <div class="detail-readonly-text">{{ team.recruitmentRequirement || '暂无' }}</div>
                <el-button type="primary" link size="small" @click="startEditRecruit">编辑</el-button>
              </div>
              <div v-else class="detail-section-edit">
                <el-input
                  v-model="editRecruitmentRequirement"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入招募人员的要求"
                />
                <div class="detail-edit-actions">
                  <el-button size="small" @click="cancelEditRecruit">取消</el-button>
                  <el-button type="primary" size="small" :loading="savingRecruit" @click="saveRecruitmentRequirement">保存</el-button>
                </div>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 历史荣誉（队长可编辑） -->
        <div class="detail-section">
          <div class="detail-section-title">历史荣誉</div>
          <div v-if="!isLeader || !editingHonors" class="detail-section-content">
            <div class="detail-readonly-text">{{ team.honors || '暂无' }}</div>
            <el-button v-if="isLeader && !editingHonors" type="primary" link size="small" @click="startEditHonors">编辑</el-button>
          </div>
          <div v-else class="detail-section-edit">
            <el-input
              v-model="editHonors"
              type="textarea"
              :rows="4"
              placeholder="请输入团队历史荣誉"
            />
            <div class="detail-edit-actions">
              <el-button size="small" @click="cancelEditHonors">取消</el-button>
              <el-button type="primary" size="small" :loading="savingHonors" @click="saveHonors">保存</el-button>
            </div>
          </div>
        </div>

        <!-- 项目标签（队长可编辑） -->
        <div class="detail-section">
          <div class="detail-section-title">项目标签</div>
          <div v-if="!isLeader || !editingTags" class="detail-section-content">
            <div v-if="tagList.length" class="detail-tags">
              <el-tag v-for="t in tagList" :key="t" size="small" effect="plain" class="detail-tag-item">{{ t }}</el-tag>
            </div>
            <div v-else class="detail-readonly-text">暂无标签</div>
            <el-button v-if="isLeader && !editingTags" type="primary" link size="small" @click="startEditTags">编辑</el-button>
          </div>
          <div v-else class="detail-section-edit">
            <el-input
              v-model="editTags"
              type="textarea"
              :rows="2"
              placeholder="多个标签请用逗号分隔，如：创新创业,科研,竞赛"
            />
            <div class="detail-edit-actions">
              <el-button size="small" @click="cancelEditTags">取消</el-button>
              <el-button type="primary" size="small" :loading="savingTags" @click="saveTags">保存</el-button>
            </div>
          </div>
        </div>

        <!-- 关联项目（通过 team_id 关联） -->
        <div class="detail-section">
          <div class="detail-section-title">关联项目</div>
          <div v-loading="loadingProjects" class="detail-section-content">
            <el-table v-if="teamProjects.length" :data="teamProjects" style="width: 100%">
              <el-table-column prop="title" label="项目标题" min-width="160">
                <template #default="{ row }">
                  <router-link :to="`/projects/${row.id}`" class="project-link">{{ row.title }}</router-link>
                </template>
              </el-table-column>
              <el-table-column prop="leaderName" label="负责人" width="100" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="projectStatusType(row.status)" size="small">{{ projectStatusText(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="160">
                <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
              </el-table-column>
            </el-table>
            <el-empty v-else description="暂无关联项目（创建项目时选择本团队即可关联）" />
          </div>
        </div>

        <el-divider>团队成员</el-divider>
        <el-tabs v-model="memberTab">
          <el-tab-pane label="已通过成员" name="approved">
            <el-table :data="approvedMembers" v-loading="loadingMembers">
              <el-table-column prop="userName" label="姓名" />
              <el-table-column prop="role" label="角色" width="120">
                <template #default="{ row }">{{ row.role === 'LEADER' ? '队长' : '成员' }}</template>
              </el-table-column>
              <el-table-column prop="joinTime" label="加入时间" width="180">
                <template #default="{ row }">{{ formatDateTime(row.joinTime) }}</template>
              </el-table-column>
              <el-table-column label="操作" width="120" v-if="isLeader">
                <template #default="{ row }">
                  <el-button
                    v-if="row.role !== 'LEADER'"
                    link
                    type="danger"
                    size="small"
                    @click="handleRemoveMember(row)"
                  >
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="待审批申请" name="pending" v-if="isLeader">
            <el-table :data="pendingMembers" v-loading="loadingMembers">
              <el-table-column prop="userName" label="申请人" />
              <el-table-column prop="joinTime" label="申请时间" width="180">
                <template #default="{ row }">{{ formatDateTime(row.joinTime) }}</template>
              </el-table-column>
              <el-table-column label="操作" width="260">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="showApplicationDetail(row)">查看</el-button>
                  <el-button
                    link
                    type="success"
                    size="small"
                    @click="handleApproveMember(row)"
                  >
                    通过
                  </el-button>
                  <el-button
                    link
                    type="danger"
                    size="small"
                    @click="handleRejectMember(row)"
                  >
                    拒绝
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="pendingMembers.length === 0" description="暂无待审批申请" />
          </el-tab-pane>
        </el-tabs>
      </div>
      <el-empty v-else description="团队不存在或已删除" />
    </el-card>

    <TeamApplyDialog
      v-model="showApplyDialog"
      :team-id="team?.id"
      :team-name="team?.name"
      @success="onApplySuccess"
    />

    <el-drawer v-model="detailDrawerVisible" title="申请详情" size="480px">
      <div v-if="currentApplication" class="application-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="姓名">{{ currentApplication.userName || '—' }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ currentApplication.studentId || '—' }}</el-descriptions-item>
          <el-descriptions-item label="年级">{{ currentApplication.grade || '—' }}</el-descriptions-item>
          <el-descriptions-item label="专业">{{ currentApplication.major || '—' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentApplication.contactPhone || '—' }}</el-descriptions-item>
          <el-descriptions-item label="比赛经历">
            <div class="detail-text">{{ currentApplication.competitionExperience || '—' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="获奖情况">
            <div class="detail-text">{{ currentApplication.awards || '—' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="简历附件">
            <template v-if="currentApplication.resumeAttachment">
              <a :href="resumeFullUrl(currentApplication.resumeAttachment)" target="_blank" rel="noopener">查看/下载简历</a>
            </template>
            <span v-else>—</span>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ formatDateTime(currentApplication.joinTime) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { getTeamById, getTeamMembers, checkIsMember, getAllTeamMembers, reviewMemberApplication, removeTeamMember, updateTeam } from '@/api/modules/team'
import { getProjectsByTeamId } from '@/api/modules/project'
import TeamApplyDialog from '@/components/TeamApplyDialog.vue'
import { useUserStore } from '@/stores/user'
import { formatDateTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const team = ref(null)
const members = ref([])
const allMembers = ref([])
const loading = ref(true)
const loadingMembers = ref(false)
const isMember = ref(false)
const hasPendingApplication = ref(false)
const memberTab = ref('approved')
const editingDesc = ref(false)
const editDescription = ref('')
const savingDesc = ref(false)
const editingRecruit = ref(false)
const editRecruitmentRequirement = ref('')
const savingRecruit = ref(false)
const editingHonors = ref(false)
const editHonors = ref('')
const savingHonors = ref(false)
const editingTags = ref(false)
const editTags = ref('')
const savingTags = ref(false)
const showApplyDialog = ref(false)
const detailDrawerVisible = ref(false)
const currentApplication = ref(null)
const teamProjects = ref([])
const loadingProjects = ref(false)
const editingExtra = ref(false)
const editTeamType = ref('')
const editInstructorName = ref('')
const editLeaderStudentId = ref('')
const editCollegeName = ref('')
const savingExtra = ref(false)

const goBack = () => {
  router.back()
}

const goEdit = () => {
  const id = route.params.id
  if (id) router.push(`/teams/${id}/edit`)
}

const getTeamTypeText = (type) => {
  const map = { INNOVATION: '创新团队', STARTUP: '创业团队', RESEARCH: '科研团队' }
  return map[type] || type || '—'
}

const loadTeam = async () => {
  const id = route.params.id
  if (!id) return
  loading.value = true
  editingDesc.value = false
  editingRecruit.value = false
  editingHonors.value = false
  editingTags.value = false
  try {
    team.value = await getTeamById(id)
    if (team.value) {
      editDescription.value = team.value.description || ''
      editRecruitmentRequirement.value = team.value.recruitmentRequirement || ''
      editHonors.value = team.value.honors || ''
      editTags.value = team.value.tags || ''
      editInstructorName.value = team.value.instructorName || ''
      editLeaderStudentId.value = team.value.leaderStudentId || ''
      editCollegeName.value = team.value.collegeName || ''
      editTeamType.value = team.value.teamType || ''
      await loadTeamProjects()
      await loadMembers()
      await loadAllMembers()
      await checkMemberStatus()
      await checkPendingApplication()
    }
  } catch (error) {
    ElMessage.error(error?.message || '加载团队详情失败')
    team.value = null
  } finally {
    loading.value = false
  }
}

const cancelEditDesc = () => {
  editingDesc.value = false
  editDescription.value = team.value ? (team.value.description || '') : ''
}

const saveDescription = async () => {
  const id = route.params.id
  if (!id || !team.value) return
  savingDesc.value = true
  try {
    await updateTeam(id, { description: editDescription.value })
    if (team.value) team.value.description = editDescription.value
    ElMessage.success('团队简介已保存')
    editingDesc.value = false
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    savingDesc.value = false
  }
}

const startEditRecruit = () => {
  editRecruitmentRequirement.value = team.value?.recruitmentRequirement || ''
  editingRecruit.value = true
}

const cancelEditRecruit = () => {
  editingRecruit.value = false
  editRecruitmentRequirement.value = team.value?.recruitmentRequirement || ''
}

const saveRecruitmentRequirement = async () => {
  const id = route.params.id
  if (!id || !team.value) return
  if (team.value.recruiting && (!editRecruitmentRequirement.value || !String(editRecruitmentRequirement.value).trim())) {
    ElMessage.error('招募内容不能为空')
    return
  }
  savingRecruit.value = true
  try {
    await updateTeam(id, { recruitmentRequirement: editRecruitmentRequirement.value })
    if (team.value) team.value.recruitmentRequirement = editRecruitmentRequirement.value
    ElMessage.success('招募要求已保存')
    editingRecruit.value = false
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    savingRecruit.value = false
  }
}

const startEditHonors = () => {
  editHonors.value = team.value?.honors || ''
  editingHonors.value = true
}

const cancelEditHonors = () => {
  editingHonors.value = false
  editHonors.value = team.value?.honors || ''
}

const saveHonors = async () => {
  const id = route.params.id
  if (!id || !team.value) return
  savingHonors.value = true
  try {
    await updateTeam(id, { honors: editHonors.value })
    if (team.value) team.value.honors = editHonors.value
    ElMessage.success('历史荣誉已保存')
    editingHonors.value = false
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    savingHonors.value = false
  }
}

const startEditTags = () => {
  editTags.value = team.value?.tags || ''
  editingTags.value = true
}

const cancelEditTags = () => {
  editingTags.value = false
  editTags.value = team.value?.tags || ''
}

const saveTags = async () => {
  const id = route.params.id
  if (!id || !team.value) return
  savingTags.value = true
  try {
    await updateTeam(id, { tags: editTags.value })
    if (team.value) team.value.tags = editTags.value
    ElMessage.success('项目标签已保存')
    editingTags.value = false
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    savingTags.value = false
  }
}

const saveExtraInfo = async () => {
  const id = route.params.id
  if (!id || !team.value) return
  savingExtra.value = true
  try {
    await updateTeam(id, {
      instructorName: editInstructorName.value || null,
      leaderStudentId: editLeaderStudentId.value || null,
      collegeName: editCollegeName.value || null,
      teamType: editTeamType.value || null
    })
    if (team.value) {
      team.value.instructorName = editInstructorName.value
      team.value.leaderStudentId = editLeaderStudentId.value
      team.value.collegeName = editCollegeName.value
      team.value.teamType = editTeamType.value
    }
    ElMessage.success('已保存')
    editingExtra.value = false
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    savingExtra.value = false
  }
}

function syncExtraFromTeam() {
  if (team.value) {
    editTeamType.value = team.value.teamType || ''
    editInstructorName.value = team.value.instructorName || ''
    editLeaderStudentId.value = team.value.leaderStudentId || ''
    editCollegeName.value = team.value.collegeName || ''
  }
}

const loadTeamProjects = async () => {
  const id = route.params.id
  if (!id) return
  loadingProjects.value = true
  try {
    teamProjects.value = await getProjectsByTeamId(id) || []
  } catch {
    teamProjects.value = []
  } finally {
    loadingProjects.value = false
  }
}

function projectStatusType(status) {
  const map = { DRAFT: 'info', PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger', IN_PROGRESS: '', COMPLETED: 'success' }
  return map[status] || ''
}

function projectStatusText(status) {
  const map = { DRAFT: '草稿', PENDING: '待审核', APPROVED: '已通过', REJECTED: '已拒绝', IN_PROGRESS: '进行中', COMPLETED: '已完成' }
  return map[status] || status
}

const loadMembers = async () => {
  const id = route.params.id
  if (!id) return
  loadingMembers.value = true
  try {
    members.value = await getTeamMembers(id) || []
  } catch {
    members.value = []
  } finally {
    loadingMembers.value = false
  }
}

const loadAllMembers = async () => {
  const id = route.params.id
  if (!id) return
  try {
    allMembers.value = await getAllTeamMembers(id) || []
  } catch {
    allMembers.value = []
  }
}

// 已通过成员：优先用 members（getTeamMembers），非队长时 allMembers 可能为空则用 members
const approvedMembers = computed(() => {
  const approved = allMembers.value.filter(m => m.approvalStatus === 'APPROVED')
  return approved.length > 0 ? approved : members.value
})

const pendingMembers = computed(() => {
  return allMembers.value.filter(m => m.approvalStatus === 'PENDING')
})

const tagList = computed(() => {
  const t = team.value?.tags
  if (!t || typeof t !== 'string') return []
  return t.split(',').map(s => s.trim()).filter(Boolean)
})

const isLeader = computed(() => {
  return team.value && userStore.user?.id === team.value.leaderId
})

const checkMemberStatus = async () => {
  const id = route.params.id
  if (!id || !userStore.user?.id) {
    isMember.value = false
    return
  }
  try {
    isMember.value = await checkIsMember(id, userStore.user.id)
  } catch (error) {
    console.error('检查成员状态失败:', error)
    isMember.value = false
  }
}

const checkPendingApplication = async () => {
  const id = route.params.id
  if (!id || !userStore.user?.id) {
    hasPendingApplication.value = false
    return
  }
  try {
    const allMembersData = await getAllTeamMembers(id) || []
    const myApplication = allMembersData.find(m => m.userId === userStore.user.id)
    hasPendingApplication.value = myApplication && myApplication.approvalStatus === 'PENDING'
  } catch (error) {
    console.error('检查申请状态失败:', error)
    hasPendingApplication.value = false
  }
}

const canJoinTeam = computed(() => {
  const userRole = userStore.userRole
  if (userRole !== 'STUDENT' && userRole !== 'TEACHER') {
    return false
  }
  // 队长关闭招募时不显示申请加入
  if (team.value && team.value.recruiting === false) {
    return false
  }
  // 已是成员或已有待审批申请时，不能再次申请
  return !isMember.value && !hasPendingApplication.value
})

const openApplyDialog = () => {
  showApplyDialog.value = true
}

const onApplySuccess = () => {
  hasPendingApplication.value = true
  loadAllMembers()
  checkPendingApplication()
}

function resumeFullUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return window.location.origin + (path.startsWith('/') ? path : '/' + path)
}

const showApplicationDetail = (row) => {
  currentApplication.value = row
  detailDrawerVisible.value = true
}

const handleApproveMember = async (member) => {
  const id = route.params.id
  if (!id) return
  try {
    await ElMessageBox.confirm(
      `确定要通过「${member.userName}」的加入申请吗？`,
      '确认通过',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    await reviewMemberApplication(id, member.id, 'APPROVED')
    ElMessage.success('已通过申请')
    await Promise.all([loadAllMembers(), loadMembers()])
    const teamData = await getTeamById(id)
    if (teamData) {
      team.value = teamData
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '操作失败')
    }
  }
}

const handleRejectMember = async (member) => {
  const id = route.params.id
  if (!id) return
  try {
    await ElMessageBox.confirm(
      `确定要拒绝「${member.userName}」的加入申请吗？`,
      '确认拒绝',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await reviewMemberApplication(id, member.id, 'REJECTED')
    ElMessage.success('已拒绝申请')
    await loadAllMembers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '操作失败')
    }
  }
}

const handleRecruitingChange = async (val) => {
  const id = route.params.id
  if (!id) return
  if (val && (!team.value?.recruitmentRequirement || !String(team.value.recruitmentRequirement).trim())) {
    ElMessage.error('开启招募时，请先填写招募内容（招募人员的要求）')
    if (team.value) team.value.recruiting = false
    return
  }
  try {
    await updateTeam(id, { recruiting: val })
    ElMessage.success('已更新招募设置')
  } catch (e) {
    ElMessage.error(e?.message || '更新失败')
    if (team.value) team.value.recruiting = !val
  }
}

const handleIsPublicChange = async (val) => {
  const id = route.params.id
  if (!id) return
  try {
    await updateTeam(id, { isPublic: val })
    ElMessage.success('已更新公开设置')
  } catch (e) {
    ElMessage.error(e?.message || '更新失败')
    if (team.value) team.value.isPublic = !val
  }
}

const handleRemoveMember = async (member) => {
  const id = route.params.id
  if (!id) return
  try {
    await ElMessageBox.confirm(
      `确定要移除成员「${member.userName}」吗？`,
      '确认移除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await removeTeamMember(id, member.id)
    ElMessage.success('已移除成员')
    await Promise.all([loadAllMembers(), loadMembers()])
    const teamData = await getTeamById(id)
    if (teamData) {
      team.value = teamData
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '操作失败')
    }
  }
}

watch(() => route.params.id, loadTeam, { immediate: false })

onMounted(loadTeam)
</script>

<style scoped>
.team-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
  font-weight: 500;
}

.detail-section-content {
  padding: 12px 0;
}

.detail-desc-text {
  white-space: pre-wrap;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.detail-section-edit .el-input {
  margin-bottom: 12px;
}

.detail-edit-actions {
  display: flex;
  gap: 8px;
}

.detail-descriptions {
  margin-top: 0;
}

.detail-readonly-text {
  white-space: pre-wrap;
  color: #606266;
  line-height: 1.6;
}

.application-detail .detail-text {
  white-space: pre-wrap;
  color: #606266;
  line-height: 1.5;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-tag-item {
  margin: 0;
}

.project-link {
  color: var(--el-color-primary);
  text-decoration: none;
}
.project-link:hover {
  text-decoration: underline;
}
</style>
