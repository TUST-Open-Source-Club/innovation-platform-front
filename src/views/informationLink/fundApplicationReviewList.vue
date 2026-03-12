<template>
  <div class="fund-application-review-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>基金申请审核</span>
        </div>
      </template>

      <!-- 筛选条件 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.title"
            placeholder="搜索申请标题"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 基金申请列表 -->
      <el-table :data="applicationList" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="申请标题" show-overflow-tooltip min-width="180" />
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
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getFundDisplayStatusType(row)">{{ getFundDisplayStatusText(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approvalStatus" label="审批状态" width="140">
          <template #default="{ row }">
            <el-tag :type="getFundDisplayApprovalType(row)">{{ getFundDisplayApprovalText(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">查看详情</el-button>
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
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && applicationList.length === 0" description="暂无基金申请数据" />
    </el-card>

    <!-- 审核对话框 -->
    <el-dialog v-model="reviewDialogVisible" :title="reviewTitle" width="600px">
      <el-form :model="reviewForm" label-width="100px">
        <el-form-item label="申请标题">
          <span>{{ currentApplication?.title }}</span>
        </el-form-item>
        <el-form-item label="申请人">
          <span>{{ currentApplication?.applicantName }}</span>
        </el-form-item>
        <el-form-item label="申请金额">
          <span>¥{{ formatAmount(currentApplication?.applicationAmount) }}</span>
        </el-form-item>
        <el-form-item
          v-if="reviewAction === 'APPROVED'"
          label="批准金额"
          prop="approvedAmount"
        >
          <el-input-number
            v-model="reviewForm.approvedAmount"
            :min="0"
            :max="currentApplication?.applicationAmount"
            :precision="2"
            :step="1000"
            placeholder="请输入批准金额"
            style="width: 100%"
          />
          <div style="color: #909399; font-size: 12px; margin-top: 5px;">
            单位：元（不超过申请金额）
          </div>
        </el-form-item>
        <el-form-item label="审核意见" prop="reviewComment">
          <el-input
            v-model="reviewForm.reviewComment"
            type="textarea"
            :rows="4"
            :placeholder="reviewAction === 'REJECTED' ? '请输入拒绝原因（必填）' : '请输入审核意见（选填）'"
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
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getFundApplications, reviewFundApplication } from '@/api/modules/fundApplication'
import { formatAmount, formatDateTime } from '@/utils/format'

const router = useRouter()

const searchForm = reactive({
  title: '',
  approvalStatus: 'PENDING' // 默认显示待审批
})

const applicationList = ref([])
const loading = ref(false)

const isRejectedFund = (row) => row?.status === 'REJECTED' || row?.approvalStatus === 'REJECTED'
const isFinalApprovedFund = (row) => row?.status === 'FUNDED' && row?.approvalStatus === 'APPROVED'
const isWaitingSchoolFund = (row) => row?.status === 'APPROVED' && row?.approvalStatus === 'PENDING'
const isWaitingCollegeFund = (row) => row?.status === 'SUBMITTED' && row?.approvalStatus === 'PENDING'

const getFundDisplayStatusText = (row) => {
  if (isRejectedFund(row)) return '未通过'
  if (isFinalApprovedFund(row)) return '已通过'
  if (isWaitingSchoolFund(row) || isWaitingCollegeFund(row)) return '已提交'
  return row?.status || ''
}

const getFundDisplayApprovalText = (row) => {
  if (isRejectedFund(row)) return '未通过'
  if (isFinalApprovedFund(row)) return '已通过'
  if (isWaitingSchoolFund(row)) return '待学校管理员审核'
  if (isWaitingCollegeFund(row)) return '待学院管理员审核'
  return row?.approvalStatus || ''
}

const getFundDisplayStatusType = (row) => {
  if (isRejectedFund(row)) return 'danger'
  if (isFinalApprovedFund(row)) return 'success'
  if (isWaitingSchoolFund(row) || isWaitingCollegeFund(row)) return 'warning'
  return ''
}

const getFundDisplayApprovalType = (row) => {
  if (isRejectedFund(row)) return 'danger'
  if (isFinalApprovedFund(row)) return 'success'
  if (isWaitingSchoolFund(row) || isWaitingCollegeFund(row)) return 'warning'
  return ''
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchForm.approvalStatus) {
      params.approvalStatus = searchForm.approvalStatus
    }
    const data = await getFundApplications(params)
    let list = Array.isArray(data) ? data : []
    
    // 如果有关键词搜索，进行过滤
    if (searchForm.title) {
      list = list.filter(item =>
        item.title && item.title.toLowerCase().includes(searchForm.title.toLowerCase())
      )
    }
    
    applicationList.value = list
  } catch (error) {
    ElMessage.error(error?.message || '加载基金申请列表失败')
    applicationList.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  searchForm.title = ''
  searchForm.approvalStatus = 'PENDING'
  loadData()
}

const handleViewDetail = (application) => {
  router.push(`/fund-applications/${application.id}`)
}

const reviewDialogVisible = ref(false)
const reviewing = ref(false)
const currentApplication = ref(null)
const reviewAction = ref('')

const reviewForm = reactive({
  approvedAmount: null,
  reviewComment: ''
})

const reviewTitle = computed(() => {
  return reviewAction.value === 'APPROVED' ? '审核通过' : '审核拒绝'
})

const handleReview = (application, action) => {
  currentApplication.value = application
  reviewAction.value = action
  reviewForm.approvedAmount = application.applicationAmount
  reviewForm.reviewComment = ''
  reviewDialogVisible.value = true
}

const handleSubmitReview = async () => {
  if (reviewAction.value === 'REJECTED' && !reviewForm.reviewComment?.trim()) {
    ElMessage.warning('拒绝时请填写拒绝原因')
    return
  }
  
  if (reviewAction.value === 'APPROVED' && (!reviewForm.approvedAmount || reviewForm.approvedAmount <= 0)) {
    ElMessage.warning('通过时请填写批准金额')
    return
  }
  
  reviewing.value = true
  try {
    await reviewFundApplication(currentApplication.value.id, {
      approvalStatus: reviewAction.value,
      approvedAmount: reviewForm.approvedAmount,
      reviewComment: reviewForm.reviewComment || ''
    })
    ElMessage.success('审核完成')
    reviewDialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error(error?.message || '审核失败')
  } finally {
    reviewing.value = false
  }
}

loadData()
</script>

<style scoped>
.fund-application-review-list {
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
