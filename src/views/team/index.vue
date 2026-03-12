<template>
  <div class="team-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>团队管理</span>
          <div>
            <el-button v-if="isAdmin" type="success" @click="handleExportExcel">导出Excel</el-button>
            <el-button v-if="isAdmin" type="warning" @click="showImportDialog = true">导入团队</el-button>
            <el-button v-if="isAdmin" @click="goToReview">入驻审核</el-button>
            <!-- 已入驻团队按钮按当前需求隐藏 -->
            <el-button @click="loadTeams" :loading="loading">刷新</el-button>
            <!-- 只有非管理员角色（学生/教师）可以创建入驻申请 -->
            <el-button v-if="!isAdmin" type="primary" @click="handleCreate">创建申请</el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 团队列表（来自 team 表） -->
        <el-tab-pane label="团队列表" name="teams">
          <div v-loading="loading" class="list-cards">
            <div
              v-for="row in teams"
              :key="row.id"
              class="list-card"
            >
              <div class="list-card-title">{{ row.name }}</div>
              <div class="list-card-meta">
                <el-tag class="list-card-tag" type="primary" size="small" effect="light">团队</el-tag>
                <el-tag v-if="row.teamType" size="small" effect="plain">{{ getTeamTypeText(row.teamType) }}</el-tag>
              </div>
              <div v-if="row.description" class="list-card-intro">
                <div class="list-card-label">团队简介</div>
                <div class="list-card-desc">{{ row.description }}</div>
              </div>
              <div class="list-card-info">
                <div class="list-card-label">基本信息</div>
                <div>团队类型：{{ row.teamType ? getTeamTypeText(row.teamType) : '—' }}</div>
                <div>负责人：{{ row.leaderName || '—' }}</div>
                <div>负责人学号：{{ row.leaderStudentId || '—' }}</div>
                <div>指导老师：{{ row.instructorName || '—' }}</div>
                <div>学院：{{ row.collegeName || '—' }}</div>
                <div>团队规模：{{ row.memberCount != null ? row.memberCount + '人' : '—' }}</div>
                <div>创建时间：{{ formatDateTime(row.createTime) }}</div>
              </div>
              <div class="list-card-recruit">
                <div class="list-card-label">招募信息</div>
                <div class="list-card-recruit-status">
                  <el-tag :type="row.recruiting !== false ? 'success' : 'info'" size="small">
                    {{ row.recruiting !== false ? '正在招募' : '暂不招募' }}
                  </el-tag>
                </div>
                <div v-if="row.recruitmentRequirement" class="list-card-recruit-desc">{{ row.recruitmentRequirement }}</div>
                <div v-else class="list-card-recruit-empty">暂无招募要求</div>
              </div>
              <div v-if="row.honors || (row.tags && tagList(row).length)" class="list-card-extra">
                <div v-if="row.honors" class="list-card-label">历史荣誉</div>
                <div v-if="row.honors" class="list-card-desc list-card-honors">{{ row.honors }}</div>
                <div v-if="tagList(row).length" class="list-card-label">项目标签</div>
                <div v-if="tagList(row).length" class="list-card-tags">
                  <el-tag v-for="t in tagList(row)" :key="t" size="small" effect="plain" class="list-card-tag-item">{{ t }}</el-tag>
                </div>
              </div>
              <div class="list-card-actions">
                <el-button type="primary" size="small" @click="handleViewTeam(row.id)">详情</el-button>
                <div class="list-card-actions-right">
                  <el-button
                    v-if="canJoinTeam(row)"
                    type="success"
                    size="small"
                    @click="openApplyDialog(row)"
                  >
                    申请加入
                  </el-button>
                  <el-tag v-else-if="hasPendingApplication(row)" type="warning" size="small">待审批</el-tag>
                  <el-tag v-else-if="isTeamMember(row)" type="success" size="small">已加入</el-tag>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-if="!loading && teams.length === 0" description="暂无团队数据" />
        </el-tab-pane>

        <!-- 我的入驻申请 -->
        <el-tab-pane label="我的入驻申请" name="applications">
          <el-table :data="myApplications" v-loading="loadingApplications" style="width: 100%">
            <template #empty>
              <el-empty description="暂无入驻申请，点击上方「创建申请」开始申请" />
            </template>
            <el-table-column prop="teamName" label="团队名称" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getEntryDisplayStatusType(row)">{{ getEntryDisplayStatusText(row) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="approvalStatus" label="审批状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getEntryDisplayApprovalType(row)">{{ getEntryDisplayApprovalText(row) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="申请时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleView(row.id)">查看</el-button>
                <el-button
                  v-if="row.status === 'DRAFT'"
                  link
                  type="primary"
                  @click="handleEdit(row.id)"
                >
                  编辑
                </el-button>
                <el-button
                  v-if="row.status === 'DRAFT'"
                  link
                  type="success"
                  @click="handleSubmit(row.id)"
                >
                  提交
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="showImportDialog" title="导入团队" width="480px" :close-on-click-modal="false">
      <p class="import-tip">请上传 Excel 文件，表格需包含列：团队名称、负责人用户名、团队简介、是否招募、是否公开、招募要求、历史荣誉、项目标签。</p>
      <el-upload
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        :on-change="onImportFileChange"
        :on-remove="onImportFileRemove"
      >
        <el-button type="primary" size="small">选择 Excel 文件</el-button>
      </el-upload>
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" :disabled="!importFile" @click="confirmImport">确定导入</el-button>
      </template>
    </el-dialog>

    <TeamApplyDialog
      v-model="showApplyDialog"
      :team-id="applyingTeam?.id"
      :team-name="applyingTeam?.name"
      @success="onApplySuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTeams, getAllTeamMembers, exportTeamsExcel, importTeamsExcel } from '@/api/modules/team'
import TeamApplyDialog from '@/components/TeamApplyDialog.vue'
import { getMyApplications, submitEntryApplication } from '@/api/modules/entryApplication'
import { usePermission } from '@/composables/usePermission'
import { useUserStore } from '@/stores/user'
import { STATUS_TEXT, STATUS_TYPE } from '@/constants'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const { isSchoolAdmin, isAdmin } = usePermission()
const userStore = useUserStore()

const activeTab = ref('teams')
const teams = ref([])
const myApplications = ref([])
const loading = ref(false)
const loadingApplications = ref(false)
const showApplyDialog = ref(false)
const applyingTeam = ref(null)
const showImportDialog = ref(false)
const importFile = ref(null)
const importLoading = ref(false)
// 存储每个团队的用户状态: 'APPROVED'=已加入, 'PENDING'=待审批, null=未申请
const teamMemberStatus = ref({})

const getStatusText = (status) => STATUS_TEXT[status] || status
const getStatusType = (status) => STATUS_TYPE[status] || ''

const isRejectedEntry = (row) => row?.status === 'REJECTED' || row?.approvalStatus === 'REJECTED'
const isFinalApprovedEntry = (row) => row?.status === 'ENTERED' && row?.approvalStatus === 'APPROVED'
const isWaitingSchoolEntry = (row) => row?.status === 'APPROVED' && row?.approvalStatus === 'PENDING'
const isWaitingCollegeEntry = (row) => row?.status === 'PENDING' && row?.approvalStatus === 'PENDING'

const getEntryDisplayStatusText = (row) => {
  if (isRejectedEntry(row)) return '未通过'
  if (isFinalApprovedEntry(row)) return '已入驻'
  if (isWaitingSchoolEntry(row) || isWaitingCollegeEntry(row)) return '已提交'
  return getStatusText(row?.status)
}

const getEntryDisplayApprovalText = (row) => {
  if (isRejectedEntry(row)) return '未通过'
  if (isFinalApprovedEntry(row)) return '已通过'
  if (isWaitingSchoolEntry(row)) return '待学校管理员审核'
  if (isWaitingCollegeEntry(row)) return '待学院管理员审核'
  return getStatusText(row?.approvalStatus)
}

const getEntryDisplayStatusType = (row) => {
  if (isRejectedEntry(row)) return 'danger'
  if (isFinalApprovedEntry(row)) return 'success'
  if (isWaitingSchoolEntry(row) || isWaitingCollegeEntry(row)) return 'warning'
  return getStatusType(row?.status)
}

const getEntryDisplayApprovalType = (row) => {
  if (isRejectedEntry(row)) return 'danger'
  if (isFinalApprovedEntry(row)) return 'success'
  if (isWaitingSchoolEntry(row) || isWaitingCollegeEntry(row)) return 'warning'
  return getStatusType(row?.approvalStatus)
}
const tagList = (row) => {
  if (!row.tags || typeof row.tags !== 'string') return []
  return row.tags.split(',').map(s => s.trim()).filter(Boolean)
}

const getTeamTypeText = (type) => {
  const map = { INNOVATION: '创新团队', STARTUP: '创业团队', RESEARCH: '科研团队' }
  return map[type] || type || '—'
}

const loadTeams = async () => {
  loading.value = true
  try {
    const data = await getTeams()
    // 兼容多种返回格式：直接数组、或 { list: [] }、或 data 为 null
    if (Array.isArray(data)) {
      teams.value = data
    } else if (data && Array.isArray(data.list)) {
      teams.value = data.list
    } else {
      teams.value = []
    }
    // 加载每个团队的成员状态
    if (userStore.user?.id && teams.value.length > 0) {
      await loadTeamMemberStatus()
    }
  } catch (error) {
    ElMessage.error(error?.message || '加载团队列表失败')
    teams.value = []
  } finally {
    loading.value = false
  }
}

const loadTeamMemberStatus = async () => {
  if (!userStore.user?.id) return
  const userId = userStore.user.id
  for (const team of teams.value) {
    try {
      const members = await getAllTeamMembers(team.id) || []
      const myRecord = members.find(m => m.userId === userId)
      teamMemberStatus.value[team.id] = myRecord?.approvalStatus || null
    } catch (error) {
      console.error(`检查团队 ${team.id} 成员状态失败:`, error)
      teamMemberStatus.value[team.id] = null
    }
  }
}

const canJoinTeam = (row) => {
  const userRole = userStore.userRole
  if (userRole !== 'STUDENT' && userRole !== 'TEACHER') {
    return false
  }
  // 队长关闭招募时不显示申请加入
  if (row.recruiting === false) {
    return false
  }
  const status = teamMemberStatus.value[row.id]
  // 未申请、或被拒绝后可以再次申请
  return !status || status === 'REJECTED'
}

const isTeamMember = (row) => {
  return teamMemberStatus.value[row.id] === 'APPROVED'
}

const hasPendingApplication = (row) => {
  return teamMemberStatus.value[row.id] === 'PENDING'
}

const openApplyDialog = (team) => {
  applyingTeam.value = team
  showApplyDialog.value = true
}

const onApplySuccess = () => {
  if (applyingTeam.value?.id) {
    teamMemberStatus.value[applyingTeam.value.id] = 'PENDING'
  }
  loadTeams()
  applyingTeam.value = null
}

const handleExportExcel = async () => {
  try {
    const blob = await exportTeamsExcel()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `团队列表_${Date.now()}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error(e?.message || '导出失败')
  }
}

const onImportFileChange = (file) => {
  importFile.value = file.raw
}

const onImportFileRemove = () => {
  importFile.value = null
}

const confirmImport = async () => {
  if (!importFile.value) return
  importLoading.value = true
  try {
    const count = await importTeamsExcel(importFile.value)
    ElMessage.success(typeof count === 'number' ? `成功导入 ${count} 个团队` : '导入成功')
    showImportDialog.value = false
    importFile.value = null
    loadTeams()
  } catch (e) {
    ElMessage.error(e?.message || '导入失败')
  } finally {
    importLoading.value = false
  }
}

const loadMyApplications = async () => {
  loadingApplications.value = true
  try {
    myApplications.value = await getMyApplications() || []
  } catch (error) {
    ElMessage.error(error?.message || '加载申请列表失败')
    myApplications.value = []
  } finally {
    loadingApplications.value = false
  }
}

const handleCreate = () => {
  router.push('/teams/create')
}

const goToReview = () => {
  router.push('/entry-applications/review')
}

const goToEntryTeams = () => {
  router.push('/entry-teams')
}

const handleViewTeam = (id) => {
  router.push(`/teams/${id}`)
}

const handleView = (id) => {
  router.push(`/entry-applications/${id}`)
}

const handleEdit = (id) => {
  router.push(`/entry-applications/${id}/edit`)
}

const handleSubmit = async (id) => {
  try {
    await ElMessageBox.confirm('确定要提交此申请吗？提交后将进入审核流程。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await submitEntryApplication(id)
    ElMessage.success('申请已提交')
    loadMyApplications()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '提交失败')
    }
  }
}

onMounted(() => {
  loadTeams()
  loadMyApplications()
})
</script>

<style scoped>
.team-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.list-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s;
}

.list-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.list-card-title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
}

.list-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.list-card-tag {
  margin: 0;
}

.list-card-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.list-card-intro {
  margin-bottom: 12px;
}

.list-card-intro .list-card-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-card-info {
  font-size: 13px;
  color: #606266;
  line-height: 1.8;
  margin-bottom: 12px;
}

.list-card-info > div:not(.list-card-label) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-card-recruit {
  margin-bottom: 12px;
}

.list-card-recruit-status {
  margin-bottom: 4px;
}

.list-card-recruit-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-card-recruit-empty {
  font-size: 13px;
  color: #c0c4cc;
}

.list-card-extra {
  margin-bottom: 12px;
}

.list-card-extra .list-card-label {
  margin-top: 8px;
}

.list-card-extra .list-card-label:first-child {
  margin-top: 0;
}

.list-card-honors {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.list-card-tag-item {
  margin: 0;
}

.list-card-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-card-actions-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.import-tip {
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.5;
}
</style>
