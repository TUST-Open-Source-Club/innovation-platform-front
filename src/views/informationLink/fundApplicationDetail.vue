<template>
  <div class="fund-application-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>基金申请详情</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <div v-if="loading" style="text-align: center; padding: 40px;">
        <el-icon class="is-loading"><Loading /></el-icon>
      </div>
      <div v-else-if="application">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请标题">{{ application.title }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ application.applicantName }}</el-descriptions-item>
          <el-descriptions-item label="关联项目">
            <el-button link type="primary" @click="viewProject(application.projectId)">
              查看项目
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item label="申请金额">¥{{ formatAmount(application.applicationAmount) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(application.status)">{{ getStatusText(application.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审批状态">
            <el-tag :type="getApprovalStatusType(application.approvalStatus)">
              {{ getApprovalStatusText(application.approvalStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="批准金额" v-if="application.approvedAmount">
            ¥{{ formatAmount(application.approvedAmount) }}
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ formatDateTime(application.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="申请理由" :span="2">
            <div style="white-space: pre-wrap;">{{ application.applicationReason }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="申请内容" :span="2">
            <div style="white-space: pre-wrap;">{{ application.applicationContent }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="预期成果" :span="2">
            <div style="white-space: pre-wrap;">{{ application.expectedOutcomes }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="审批意见" v-if="application.reviewComment" :span="2">
            <div style="white-space: pre-wrap;">{{ application.reviewComment }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="审批时间" v-if="application.reviewTime">
            {{ formatDateTime(application.reviewTime) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <el-empty v-else description="申请不存在或已删除" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { formatAmount, formatDateTime } from '@/utils/format'
import { getFundApplicationById } from '@/api/modules/fundApplication'

const route = useRoute()
const router = useRouter()

const application = ref(null)
const loading = ref(true)

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

const goBack = () => {
  router.back()
}

const viewProject = (projectId) => {
  router.push(`/projects/${projectId}`)
}

const loadApplication = async () => {
  const id = route.params.id
  if (!id) return
  loading.value = true
  try {
    application.value = await getFundApplicationById(id)
  } catch (error) {
    ElMessage.error(error?.message || '加载申请详情失败')
    application.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadApplication)
</script>

<style scoped>
.fund-application-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
