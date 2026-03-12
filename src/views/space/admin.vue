<template>
  <div class="space-reservation-admin">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>空间预约审核</span>
        </div>
      </template>

      <!-- 筛选条件 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="预约日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 预约列表 -->
      <el-table :data="reservations" v-loading="loading" style="width: 100%">
        <el-table-column prop="spaceId" label="空间ID" width="90" />
        <el-table-column prop="applicantName" label="申请人" />
        <el-table-column prop="reservationDate" label="预约日期" />
        <el-table-column label="时间段">
          <template #default="{ row }">
            {{ formatTime(row.startTime) }} - {{ formatTime(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="使用目的" show-overflow-tooltip />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getReservationDisplayStatusType(row)">{{ getReservationDisplayStatusText(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approvalStatus" label="审批状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getReservationDisplayApprovalType(row)">{{ getReservationDisplayApprovalText(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              v-if="row.approvalStatus === 'PENDING'"
              link
              type="success"
              @click="handleReview(row, 'APPROVED')"
            >
              通过
            </el-button>
            <el-button
              v-if="row.approvalStatus === 'PENDING'"
              link
              type="danger"
              @click="handleReview(row, 'REJECTED')"
            >
              拒绝
            </el-button>
            <el-button link type="primary" @click="handleViewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 审核对话框 -->
    <el-dialog v-model="reviewDialogVisible" title="审核预约申请" width="500px">
      <el-form :model="reviewForm" label-width="100px">
        <el-form-item label="申请人">
          <span>{{ currentReservation?.applicantName }}</span>
        </el-form-item>
        <el-form-item label="预约日期">
          <span>{{ currentReservation?.reservationDate }}</span>
        </el-form-item>
        <el-form-item label="时间段">
          <span>
            {{ formatTime(currentReservation?.startTime) }} -
            {{ formatTime(currentReservation?.endTime) }}
          </span>
        </el-form-item>
        <el-form-item label="使用目的">
          <span>{{ currentReservation?.purpose }}</span>
        </el-form-item>
        <el-form-item label="审批意见" prop="reviewComment">
          <el-input
            v-model="reviewForm.reviewComment"
            type="textarea"
            :rows="3"
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="reviewing" @click="handleSubmitReview">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPendingReservations, getReservationsByStatus, reviewReservation } from '@/api/modules/space'
import { STATUS_TEXT, STATUS_TYPE } from '@/constants'
import { formatTime } from '@/utils/format'

const router = useRouter()
const reservations = ref([])
const loading = ref(false)
const reviewing = ref(false)
const reviewDialogVisible = ref(false)
const currentReservation = ref(null)
const reviewAction = ref('')

const searchForm = reactive({
  status: 'PENDING',
  dateRange: null
})

const reviewForm = reactive({
  reviewComment: ''
})

const getStatusText = (status) => STATUS_TEXT[status] || status
const getStatusType = (status) => STATUS_TYPE[status] || ''

const isRejected = (row) => row?.status === 'REJECTED' || row?.approvalStatus === 'REJECTED'
const isFinalApproved = (row) => row?.status === 'APPROVED' && row?.approvalStatus === 'APPROVED'
const isWaitingSchool = (row) => row?.status === 'APPROVED' && row?.approvalStatus === 'PENDING'
const isWaitingCollege = (row) => row?.status === 'PENDING' && row?.approvalStatus === 'PENDING'

const getReservationDisplayStatusText = (row) => {
  if (isRejected(row)) return '未通过'
  if (isFinalApproved(row)) return '已通过'
  if (isWaitingSchool(row) || isWaitingCollege(row)) return '已提交'
  return getStatusText(row?.status)
}

const getReservationDisplayApprovalText = (row) => {
  if (isRejected(row)) return '未通过'
  if (isFinalApproved(row)) return '已通过'
  if (isWaitingSchool(row)) return '待学校管理员审核'
  if (isWaitingCollege(row)) return '待学院管理员审核'
  return getStatusText(row?.approvalStatus)
}

const getReservationDisplayStatusType = (row) => {
  if (isRejected(row)) return 'danger'
  if (isFinalApproved(row)) return 'success'
  if (isWaitingSchool(row) || isWaitingCollege(row)) return 'warning'
  return getStatusType(row?.status)
}

const getReservationDisplayApprovalType = (row) => {
  if (isRejected(row)) return 'danger'
  if (isFinalApproved(row)) return 'success'
  if (isWaitingSchool(row) || isWaitingCollege(row)) return 'warning'
  return getStatusType(row?.approvalStatus)
}

const loadReservations = async () => {
  loading.value = true
  try {
    if (!searchForm.status) {
      reservations.value = await getReservationsByStatus()
    } else if (searchForm.status === 'PENDING') {
      reservations.value = await getPendingReservations()
    } else {
      reservations.value = await getReservationsByStatus(searchForm.status)
    }
  } catch (error) {
    ElMessage.error(error.message || '加载预约列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  loadReservations()
}

const handleReset = () => {
  searchForm.status = 'PENDING'
  searchForm.dateRange = null
  loadReservations()
}

const handleReview = (reservation, action) => {
  currentReservation.value = reservation
  reviewAction.value = action
  reviewForm.reviewComment = ''
  reviewDialogVisible.value = true
}

const handleSubmitReview = async () => {
  reviewing.value = true
  try {
    await reviewReservation(currentReservation.value.id, {
      approvalStatus: reviewAction.value,
      reviewComment: reviewForm.reviewComment
    })
    ElMessage.success('审核完成')
    reviewDialogVisible.value = false
    loadReservations()
  } catch (error) {
    ElMessage.error(error.message || '审核失败')
  } finally {
    reviewing.value = false
  }
}

const handleViewDetail = (reservation) => {
  router.push(`/spaces/${reservation.spaceId}`)
}

onMounted(() => {
  loadReservations()
})
</script>

<style scoped>
.space-reservation-admin {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>
