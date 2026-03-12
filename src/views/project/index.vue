<template>
  <div class="project-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目管理</span>
          <div>
            <el-button @click="loadProjects" :loading="loading" style="margin-right: 10px">刷新</el-button>
            <el-button v-if="!isAdmin" type="primary" @click="handleCreate">创建项目</el-button>
          </div>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="所有项目" name="all" :disabled="false">
          <div v-loading="loading" class="list-cards">
            <div
              v-for="row in projects"
              :key="row.id"
              class="list-card"
            >
              <div class="list-card-title">{{ row.title }}</div>
              <el-tag class="list-card-tag" :type="getProjectDisplayStatusType(row)" size="small">
                {{ getProjectDisplayStatusText(row) }}
              </el-tag>
              <el-tag
                v-if="row.status !== 'DRAFT' && getProjectDisplayApprovalText(row)"
                class="list-card-tag approval-tag"
                :type="getProjectDisplayApprovalType(row)"
                size="small"
                effect="plain"
              >
                {{ getProjectDisplayApprovalText(row) }}
              </el-tag>
              <div class="list-card-info">
                <div>负责人：{{ row.leaderName || '—' }}</div>
                <div>负责人电话：{{ row.leaderPhone || '—' }}</div>
                <div>指导老师：{{ row.instructorName || '—' }}</div>
                <div>类别：{{ row.category || '—' }}</div>
                <div>创建时间：{{ formatDateTime(row.createTime) }}</div>
              </div>
              <div v-if="row.description" class="list-card-desc">{{ row.description }}</div>
              <div class="list-card-actions">
                <el-button type="primary" size="small" @click="handleView(row.id)">查看</el-button>
                <el-button
                  v-if="row.leaderId === userStore.user?.id"
                  type="primary"
                  size="small"
                  @click="handleEdit(row.id)"
                >
                  编辑
                </el-button>
                <el-button
                  v-if="row.status === 'DRAFT' && row.leaderId === userStore.user?.id"
                  type="success"
                  size="small"
                  @click="handleSubmit(row.id)"
                >
                  提交
                </el-button>
              </div>
            </div>
          </div>
          <el-empty v-if="!loading && projects.length === 0" description="暂无项目数据" />
        </el-tab-pane>

        <el-tab-pane label="我的项目" name="my" :disabled="false">
          <div v-loading="loadingMy" class="list-cards">
            <div
              v-for="row in myProjects"
              :key="row.id"
              class="list-card"
            >
              <div class="list-card-title">{{ row.title }}</div>
              <el-tag class="list-card-tag" :type="getProjectDisplayStatusType(row)" size="small">
                {{ getProjectDisplayStatusText(row) }}
              </el-tag>
              <el-tag
                v-if="row.status !== 'DRAFT' && getProjectDisplayApprovalText(row)"
                class="list-card-tag approval-tag"
                :type="getProjectDisplayApprovalType(row)"
                size="small"
                effect="plain"
              >
                {{ getProjectDisplayApprovalText(row) }}
              </el-tag>
              <div class="list-card-info">
                <div>负责人：{{ row.leaderName || '—' }}</div>
                <div>负责人电话：{{ row.leaderPhone || '—' }}</div>
                <div>指导老师：{{ row.instructorName || '—' }}</div>
                <div>类别：{{ row.category || '—' }}</div>
                <div>创建时间：{{ formatDateTime(row.createTime) }}</div>
              </div>
              <div v-if="row.description" class="list-card-desc">{{ row.description }}</div>
              <div class="list-card-actions">
                <el-button type="primary" size="small" @click="handleView(row.id)">查看</el-button>
                <el-button
                  v-if="row.leaderId === userStore.user?.id"
                  type="primary"
                  size="small"
                  @click="handleEdit(row.id)"
                >
                  编辑
                </el-button>
                <el-button
                  v-if="row.status === 'DRAFT' && row.leaderId === userStore.user?.id"
                  type="success"
                  size="small"
                  @click="handleSubmit(row.id)"
                >
                  提交
                </el-button>
              </div>
            </div>
          </div>
          <el-empty v-if="!loadingMy && myProjects.length === 0" description="暂无项目数据" />
        </el-tab-pane>

        <el-tab-pane label="无人接管项目" name="unclaimed">
          <div v-loading="loadingUnclaimed" class="list-cards">
            <div
              v-for="row in unclaimedProjects"
              :key="row.id"
              class="list-card"
            >
              <div class="list-card-title">{{ row.title }}</div>
              <el-tag class="list-card-tag" type="warning" size="small">负责人虚位以待</el-tag>
              <el-tag class="list-card-tag" :type="getProjectDisplayStatusType(row)" size="small">
                {{ getProjectDisplayStatusText(row) }}
              </el-tag>
              <div class="list-card-info">
                <div>上一任负责人：{{ row.previousLeaderName || '—' }}</div>
                <div>联系方式：{{ row.previousLeaderPhone || '—' }}</div>
                <div>类别：{{ row.category || '—' }}</div>
                <div>创建时间：{{ formatDateTime(row.createTime) }}</div>
              </div>
              <div v-if="row.description" class="list-card-desc">{{ row.description }}</div>
              <div class="list-card-actions">
                <el-button type="primary" size="small" @click="handleView(row.id)">查看</el-button>
                <el-button
                  v-if="userStore.user?.role === 'TEACHER'"
                  type="success"
                  size="small"
                  @click="handleTakeoverFromList(row.id)"
                >
                  申请接管
                </el-button>
              </div>
            </div>
          </div>
          <el-empty v-if="!loadingUnclaimed && unclaimedProjects.length === 0" description="暂无无人接管项目" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyProjects, getProjects, getUnclaimedProjects, submitProject } from '@/api/modules/project'
import { applyTakeoverProject } from '@/api/modules/informationLink'
import { useUserStore } from '@/stores/user'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('all')
const projects = ref([])
const myProjects = ref([])
const unclaimedProjects = ref([])
const loading = ref(false)
const loadingMy = ref(false)
const loadingUnclaimed = ref(false)

// 判断是否为管理员
const isAdmin = computed(() => {
  const role = userStore.user?.role
  return role === 'COLLEGE_ADMIN' || role === 'SCHOOL_ADMIN'
})

// “所有项目”列表：只展示已通过的项目
const filterVisibleProjects = (list) => {
  if (!Array.isArray(list)) return []
  return list.filter(p => {
    if (!p) return false
    // 隐藏草稿、未提交/待审核、未通过
    if (p.status === 'DRAFT') return false
    if (p.status === 'PENDING' || p.approvalStatus === 'PENDING') return false
    if (p.status === 'REJECTED' || p.approvalStatus === 'REJECTED') return false
    // 仅显示已通过（兼容历史数据 approvalStatus 可能为空的情况）
    return !p.approvalStatus || p.approvalStatus === 'APPROVED'
  })
}

const getStatusType = (status) => {
  const statusMap = {
    DRAFT: 'info',
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    IN_PROGRESS: '',
    COMPLETED: 'success'
  }
  return statusMap[status] || ''
}

const getStatusText = (status) => {
  const statusMap = {
    DRAFT: '草稿',
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
    IN_PROGRESS: '进行中',
    COMPLETED: '已完成'
  }
  return statusMap[status] || status
}

const isEndedProject = (row) => {
  if (!row?.endTime) return false
  const end = new Date(row.endTime)
  return !Number.isNaN(end.getTime()) && end.getTime() <= Date.now()
}

const isRejectedProject = (row) => row?.status === 'REJECTED' || row?.approvalStatus === 'REJECTED'
const isFinalApprovedProject = (row) => row?.status === 'APPROVED' && row?.approvalStatus === 'APPROVED'
const isWaitingSchoolProject = (row) => row?.status === 'APPROVED' && row?.approvalStatus === 'PENDING'
const isWaitingCollegeProject = (row) => row?.status === 'PENDING' && row?.approvalStatus === 'PENDING'

const getProjectDisplayStatusText = (row) => {
  if (!row) return ''
  if (row.status === 'DRAFT') return '草稿'
  if (isRejectedProject(row)) return '未通过'
  if (isWaitingSchoolProject(row) || isWaitingCollegeProject(row)) return '已提交'
  if (isFinalApprovedProject(row)) return isEndedProject(row) ? '已结束' : '进行中'
  return getStatusText(row.status)
}

const getProjectDisplayApprovalText = (row) => {
  if (!row) return ''
  if (row.status === 'DRAFT') return ''
  if (isRejectedProject(row)) return '未通过'
  if (isWaitingSchoolProject(row)) return '待学校管理员审核'
  if (isWaitingCollegeProject(row)) return '待学院管理员审核'
  if (isFinalApprovedProject(row)) return '已通过'
  return getStatusText(row.approvalStatus)
}

const getProjectDisplayStatusType = (row) => {
  if (!row) return ''
  if (row.status === 'DRAFT') return 'info'
  if (isRejectedProject(row)) return 'danger'
  if (isWaitingSchoolProject(row) || isWaitingCollegeProject(row)) return 'warning'
  if (isFinalApprovedProject(row)) return isEndedProject(row) ? 'success' : ''
  return getStatusType(row.status)
}

const getProjectDisplayApprovalType = (row) => {
  if (!row) return ''
  if (row.status === 'DRAFT') return 'info'
  if (isRejectedProject(row)) return 'danger'
  if (isWaitingSchoolProject(row) || isWaitingCollegeProject(row)) return 'warning'
  if (isFinalApprovedProject(row)) return 'success'
  return getStatusType(row.approvalStatus)
}

const loadProjects = async () => {
  loading.value = true
  try {
    const data = await getProjects()
    
    // 处理多种返回格式
    if (Array.isArray(data)) {
      projects.value = isAdmin.value ? data : filterVisibleProjects(data)
    } else if (data && Array.isArray(data.list)) {
      projects.value = isAdmin.value ? data.list : filterVisibleProjects(data.list)
    } else {
      projects.value = []
    }
  } catch (error) {
    console.error('加载项目列表失败:', error)
    ElMessage.error(error?.message || '加载项目列表失败')
    projects.value = []
  } finally {
    loading.value = false
  }
}

const loadMyProjects = async () => {
  loadingMy.value = true
  try {
    const data = await getMyProjects()
    
    // 处理多种返回格式
    if (Array.isArray(data)) {
      // “我的项目”保留所有状态，包括未通过
      myProjects.value = data
    } else if (data && Array.isArray(data.list)) {
      myProjects.value = data.list
    } else {
      myProjects.value = []
    }
  } catch (error) {
    console.error('加载我的项目失败:', error)
    ElMessage.error(error?.message || '加载我的项目失败')
    myProjects.value = []
  } finally {
    loadingMy.value = false
  }
}

const loadUnclaimedProjects = async () => {
  loadingUnclaimed.value = true
  try {
    const data = await getUnclaimedProjects()
    unclaimedProjects.value = Array.isArray(data) ? data : (data?.list || [])
  } catch {
    unclaimedProjects.value = []
  } finally {
    loadingUnclaimed.value = false
  }
}

const handleTabChange = (tabName) => {
  if (tabName === 'all') {
    loadProjects()
  } else if (tabName === 'my') {
    loadMyProjects()
  } else if (tabName === 'unclaimed') {
    loadUnclaimedProjects()
  }
}

const handleTakeoverFromList = async (id) => {
  try {
    await applyTakeoverProject(id)
    ElMessage.success('申请接管成功')
    loadUnclaimedProjects()
  } catch (e) {
    ElMessage.error(e?.message || '申请失败')
  }
}

const handleCreate = () => {
  router.push('/projects/create')
}

const handleView = (id) => {
  router.push(`/projects/${id}`)
}

const handleEdit = (id) => {
  router.push(`/projects/${id}/edit`)
}

const handleSubmit = async (id) => {
  try {
    await ElMessageBox.confirm('确定要提交该项目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await submitProject(id)
    ElMessage.success('提交成功')
    // 根据当前标签页刷新对应的列表
    if (activeTab.value === 'all') {
      loadProjects()
    } else if (activeTab.value === 'my') {
      loadMyProjects()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '提交失败')
    }
  }
}

onMounted(() => {
  // 根据路由参数 tab 设置默认标签页，例如 ?tab=unclaimed
  const initialTab = router.currentRoute.value.query.tab
  if (initialTab === 'all' || initialTab === 'my' || initialTab === 'unclaimed') {
    activeTab.value = initialTab
  }
  // 加载对应标签数据
  if (activeTab.value === 'all') {
    loadProjects()
    loadMyProjects()
  } else if (activeTab.value === 'my') {
    loadMyProjects()
    loadUnclaimedProjects()
  } else if (activeTab.value === 'unclaimed') {
    loadUnclaimedProjects()
    loadMyProjects()
  }
})
</script>

<style scoped>
.project-list {
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

.list-card-tag {
  margin-bottom: 12px;
}

.approval-tag {
  margin-left: 8px;
  margin-top: 0;
  display: inline-flex;
  align-items: center;
  border-radius: 2px;
}

.list-card-info {
  font-size: 13px;
  color: #606266;
  line-height: 1.8;
}

.list-card-info div {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-card-desc {
  font-size: 13px;
  color: #909399;
  margin-top: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-card-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
</style>
