/**
 * 基金申请页面
 */
<template>
  <div class="fund-applications">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>基金申请</span>
          <div>
            <el-button @click="loadApplications" :loading="loading" style="margin-right: 10px">刷新</el-button>
            <el-button v-if="canCreate" type="primary" @click="handleCreate">发起申请</el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane v-if="isAdmin" label="所有申请" name="all">
          <el-table :data="applications" v-loading="loading" style="width: 100%">
            <el-table-column prop="title" label="申请标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="applicantName" label="申请人" width="120" />
            <el-table-column prop="applicationAmount" label="申请金额" width="120">
              <template #default="{ row }">
                ¥{{ formatAmount(row.applicationAmount) }}
              </template>
            </el-table-column>
            <el-table-column prop="approvedAmount" label="批准金额" width="120">
              <template #default="{ row }">
                <span v-if="row.approvedAmount">¥{{ formatAmount(row.approvedAmount) }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getFundDisplayStatusType(row)">{{ getFundDisplayStatusText(row) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="approvalStatus" label="审批状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getFundDisplayApprovalType(row)">{{ getFundDisplayApprovalText(row) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="申请时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleView(row.id)">查看</el-button>
                <el-button
                  v-if="isAdmin && row.approvalStatus === 'PENDING'"
                  link
                  type="success"
                  @click="handleReview(row.id)"
                >
                  审核
                </el-button>
                <el-button
                  v-if="row.status === 'DRAFT' && row.applicantId === userStore.user?.id"
                  link
                  type="primary"
                  @click="handleEdit(row.id)"
                >
                  编辑
                </el-button>
                <el-button
                  v-if="row.status === 'DRAFT' && row.applicantId === userStore.user?.id"
                  link
                  type="success"
                  @click="handleSubmit(row.id)"
                >
                  提交
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!loading && applications.length === 0" description="暂无基金申请" />
        </el-tab-pane>

        <el-tab-pane label="我的申请" name="my" v-if="canCreate">
          <el-table :data="myApplications" v-loading="loadingMy" style="width: 100%">
            <el-table-column prop="title" label="申请标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="applicationAmount" label="申请金额" width="120">
              <template #default="{ row }">
                ¥{{ formatAmount(row.applicationAmount) }}
              </template>
            </el-table-column>
            <el-table-column prop="approvedAmount" label="批准金额" width="120">
              <template #default="{ row }">
                <span v-if="row.approvedAmount">¥{{ formatAmount(row.approvedAmount) }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getFundDisplayStatusType(row)">{{ getFundDisplayStatusText(row) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="approvalStatus" label="审批状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getFundDisplayApprovalType(row)">{{ getFundDisplayApprovalText(row) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="申请时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
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
          <el-empty v-if="!loadingMy && myApplications.length === 0" description="暂无基金申请" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePermission } from '@/composables/usePermission'
import { useUserStore } from '@/stores/user'
import { STATUS_TEXT, STATUS_TYPE } from '@/constants'
import { formatAmount, formatDateTime } from '@/utils/format'
import { getFundApplications, getMyFundApplications, submitFundApplication } from '@/api/modules/fundApplication'

const router = useRouter()
const { isAdmin: isAdminPermission } = usePermission()
const userStore = useUserStore()

const activeTab = ref('all')
const isAdmin = computed(() => {
  const role = userStore.user?.role
  if (role === 'SCHOOL_ADMIN' || role === 'COLLEGE_ADMIN') return true
  return !!isAdminPermission?.value
})

const applications = ref([])
const myApplications = ref([])
const loading = ref(false)
const loadingMy = ref(false)

const canCreate = computed(() => {
  const role = userStore.user?.role
  return role === 'STUDENT' || role === 'TEACHER'
})

const getStatusText = (status) => {
  const statusMap = {
    DRAFT: '草稿',
    SUBMITTED: '已提交',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
    FUNDED: '已资助'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const statusMap = {
    DRAFT: 'info',
    SUBMITTED: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    FUNDED: 'success'
  }
  return statusMap[status] || ''
}

const getApprovalStatusText = (status) => {
  const statusMap = {
    PENDING: '待审批',
    APPROVED: '已通过',
    REJECTED: '已拒绝'
  }
  return statusMap[status] || status
}

const getApprovalStatusType = (status) => {
  const statusMap = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger'
  }
  return statusMap[status] || ''
}

const isRejectedFund = (row) => row?.status === 'REJECTED' || row?.approvalStatus === 'REJECTED'
const isFinalApprovedFund = (row) => row?.status === 'FUNDED' && row?.approvalStatus === 'APPROVED'
const isWaitingSchoolFund = (row) => row?.status === 'APPROVED' && row?.approvalStatus === 'PENDING'
const isWaitingCollegeFund = (row) => row?.status === 'SUBMITTED' && row?.approvalStatus === 'PENDING'

const getFundDisplayStatusText = (row) => {
  if (isRejectedFund(row)) return '未通过'
  if (isFinalApprovedFund(row)) return '已通过'
  if (isWaitingSchoolFund(row) || isWaitingCollegeFund(row)) return '已提交'
  return getStatusText(row?.status)
}

const getFundDisplayApprovalText = (row) => {
  if (isRejectedFund(row)) return '未通过'
  if (isFinalApprovedFund(row)) return '已通过'
  if (isWaitingSchoolFund(row)) return '待学校管理员审核'
  if (isWaitingCollegeFund(row)) return '待学院管理员审核'
  return getApprovalStatusText(row?.approvalStatus)
}

const getFundDisplayStatusType = (row) => {
  if (isRejectedFund(row)) return 'danger'
  if (isFinalApprovedFund(row)) return 'success'
  if (isWaitingSchoolFund(row) || isWaitingCollegeFund(row)) return 'warning'
  return getStatusType(row?.status)
}

const getFundDisplayApprovalType = (row) => {
  if (isRejectedFund(row)) return 'danger'
  if (isFinalApprovedFund(row)) return 'success'
  if (isWaitingSchoolFund(row) || isWaitingCollegeFund(row)) return 'warning'
  return getApprovalStatusType(row?.approvalStatus)
}

const loadApplications = async () => {
  loading.value = true
  try {
    const data = await getFundApplications()
    if (Array.isArray(data)) {
      applications.value = data
    } else if (data && Array.isArray(data.list)) {
      applications.value = data.list
    } else {
      applications.value = []
    }
  } catch (error) {
    ElMessage.error(error?.message || '加载数据失败')
    applications.value = []
  } finally {
    loading.value = false
  }
}

const loadMyApplications = async () => {
  loadingMy.value = true
  try {
    const data = await getMyFundApplications()
    if (Array.isArray(data)) {
      myApplications.value = data
    } else if (data && Array.isArray(data.list)) {
      myApplications.value = data.list
    } else {
      myApplications.value = []
    }
  } catch (error) {
    ElMessage.error(error?.message || '加载我的申请失败')
    myApplications.value = []
  } finally {
    loadingMy.value = false
  }
}

const handleTabChange = (tabName) => {
  if (tabName === 'all') {
    loadApplications()
  } else if (tabName === 'my') {
    loadMyApplications()
  }
}

const handleCreate = () => {
  router.push('/fund-applications/create')
}

const handleView = (id) => {
  router.push(`/fund-applications/${id}`)
}

const handleEdit = (id) => {
  router.push(`/fund-applications/${id}/edit`)
}

const handleReview = (id) => {
  router.push(`/fund-applications/${id}/review`)
}

const handleSubmit = async (id) => {
  try {
    await ElMessageBox.confirm('确定要提交此基金申请吗？提交后将进入审核流程。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await submitFundApplication(id)
    ElMessage.success('提交成功')
    if (activeTab.value === 'all') {
      loadApplications()
    } else {
      loadMyApplications()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '提交失败')
    }
  }
}

onMounted(() => {
  if (isAdmin.value) {
    loadApplications()
  } else {
    activeTab.value = 'my'
    if (canCreate.value) {
      loadMyApplications()
    }
  }
})
</script>

<style scoped>
.fund-applications {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
