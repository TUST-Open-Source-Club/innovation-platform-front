<template>
  <div class="entry-application">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>入驻申请</span>
          <el-button type="primary" @click="handleCreate">创建申请</el-button>
        </div>
      </template>

      <!-- 我的申请列表 -->
      <el-table :data="myApplications" v-loading="loading" style="width: 100%">
        <el-table-column prop="teamName" label="团队名称" />
        <el-table-column prop="applicationType" label="申请类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getApplicationTypeText(row.applicationType) }}</el-tag>
          </template>
        </el-table-column>
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
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyApplications, submitEntryApplication } from '@/api/modules/entryApplication'
import { STATUS_TEXT, STATUS_TYPE } from '@/constants'
import { formatDateTime } from '@/utils/format'

const router = useRouter()

const myApplications = ref([])
const loading = ref(false)

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

const getApplicationTypeText = (type) => {
  const map = {
    'INDIVIDUAL': '个人入驻',
    'TEAM': '团队入驻',
    'ORGANIZATION': '组织入驻'
  }
  return map[type] || type
}

const loadMyApplications = async () => {
  loading.value = true
  try {
    myApplications.value = await getMyApplications()
  } catch (error) {
    ElMessage.error('加载申请列表失败')
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  router.push('/entry-applications/create')
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
      ElMessage.error(error.message || '提交失败')
    }
  }
}

onMounted(() => {
  loadMyApplications()
})
</script>

<style scoped>
.entry-application {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
