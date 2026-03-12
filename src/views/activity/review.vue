<template>
  <div class="activity-review">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>活动审批</span>
        </div>
      </template>

      <!-- 筛选条件 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索活动标题"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 活动列表 -->
      <el-table :data="activities" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="活动标题" />
        <el-table-column prop="organizerName" label="组织者" />
        <el-table-column prop="startTime" label="开始时间">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getActivityDisplayStatusType(row)">{{ getActivityDisplayStatusText(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approvalStatus" label="审批状态">
          <template #default="{ row }">
            <el-tag :type="getActivityDisplayApprovalType(row)">{{ getActivityDisplayApprovalText(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row.id)">查看详情</el-button>
            <el-button
              v-if="isAdmin"
              link
              type="primary"
              @click="handleEdit(row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-if="canReview(row)"
              link
              type="success"
              @click="handleReview(row, 'APPROVED')"
            >
              通过
            </el-button>
            <el-button
              v-if="canReview(row)"
              link
              type="danger"
              @click="handleReview(row, 'REJECTED')"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="!loading && activities.length === 0" description="暂无待审核活动" />
    </el-card>

    <!-- 审批对话框 -->
    <el-dialog v-model="reviewDialogVisible" :title="reviewTitle" width="600px">
      <el-form :model="reviewForm" label-width="120px">
        <el-form-item label="活动标题">
          <span>{{ currentActivity?.title }}</span>
        </el-form-item>
        <el-form-item label="组织者">
          <span>{{ currentActivity?.organizerName }}</span>
        </el-form-item>
        <el-form-item label="开始时间">
          <span>{{ formatDateTime(currentActivity?.startTime) }}</span>
        </el-form-item>
        <el-form-item label="活动地点">
          <span>{{ currentActivity?.location }}</span>
        </el-form-item>
        <el-form-item label="活动描述">
          <span>{{ currentActivity?.description }}</span>
        </el-form-item>
        <el-form-item label="审批意见" prop="reviewComment">
          <el-input
            v-model="reviewForm.reviewComment"
            type="textarea"
            :rows="4"
            :placeholder="reviewAction === 'REJECTED' ? '请输入拒绝原因（必填）' : '请输入审批意见（选填）'"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getActivities, collegeReview, schoolReview } from '@/api/modules/activity'
import { usePermission } from '@/composables/usePermission'
import { useUserStore } from '@/stores/user'
import { STATUS_TEXT, STATUS_TYPE } from '@/constants'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const userStore = useUserStore()
const { isCollegeAdmin, isSchoolAdmin, isAdmin } = usePermission()

const activities = ref([])
const loading = ref(false)
const reviewing = ref(false)
const reviewDialogVisible = ref(false)
const currentActivity = ref(null)
const reviewAction = ref('')
const reviewType = ref('') // 'college' or 'school'

const searchForm = reactive({
  approvalStatus: 'PENDING',
  keyword: ''
})

const reviewForm = reactive({
  reviewComment: ''
})

const reviewTitle = computed(() => {
  if (reviewType.value === 'college') {
    return '学院管理员初审'
  } else {
    return '学校管理员终审'
  }
})

const getStatusText = (status) => STATUS_TEXT[status] || status
const getStatusType = (status) => STATUS_TYPE[status] || ''

const isRejected = (row) => row?.status === 'REJECTED' || row?.approvalStatus === 'REJECTED'
const isFinalApproved = (row) => row?.status === 'PUBLISHED' && row?.approvalStatus === 'APPROVED'
const isWaitingSchool = (row) => row?.status === 'APPROVED' && row?.approvalStatus === 'PENDING'
const isWaitingCollege = (row) => row?.status === 'SUBMITTED' && row?.approvalStatus === 'PENDING'

const getActivityDisplayStatusText = (row) => {
  if (isRejected(row)) return '未通过'
  if (isFinalApproved(row)) return '已通过'
  if (isWaitingSchool(row) || isWaitingCollege(row)) return '已提交'
  return getStatusText(row?.status)
}

const getActivityDisplayApprovalText = (row) => {
  if (isRejected(row)) return '未通过'
  if (isFinalApproved(row)) return '已通过'
  if (isWaitingSchool(row)) return '待学校管理员审核'
  if (isWaitingCollege(row)) return '待学院管理员审核'
  return getStatusText(row?.approvalStatus)
}

const getActivityDisplayStatusType = (row) => {
  if (isRejected(row)) return 'danger'
  if (isFinalApproved(row)) return 'success'
  if (isWaitingSchool(row) || isWaitingCollege(row)) return 'warning'
  return getStatusType(row?.status)
}

const getActivityDisplayApprovalType = (row) => {
  if (isRejected(row)) return 'danger'
  if (isFinalApproved(row)) return 'success'
  if (isWaitingSchool(row) || isWaitingCollege(row)) return 'warning'
  return getStatusType(row?.approvalStatus)
}

// 判断是否可以审核
const canReview = (row) => {
  // 只有管理员可以审核
  if (!isAdmin.value) {
    return false
  }
  
  // 学院管理员或学校管理员：可以审核已提交且待审批的活动（初审）
  if (row.status === 'SUBMITTED' && row.approvalStatus === 'PENDING') {
    return true
  }
  // 学校管理员：可以审核学院已通过的活动（终审）
  if (isSchoolAdmin.value && row.status === 'APPROVED' && row.approvalStatus === 'PENDING') {
    return true
  }
  return false
}

const loadActivities = async () => {
  loading.value = true
  try {
    const result = await getActivities({
      pageNum: 1,
      pageSize: 100,
      // 待审批：
      // - 学院管理员看 SUBMITTED
      // - 学校管理员看 APPROVED（学院已通过，待终审）
      status: searchForm.approvalStatus === 'PENDING'
        ? (isSchoolAdmin.value ? 'APPROVED' : 'SUBMITTED')
        : undefined,
      approvalStatus: searchForm.approvalStatus,
      title: searchForm.keyword || undefined
    })
    // 处理多种返回格式：PageResult { list: [], total: number } 或直接数组
    if (Array.isArray(result)) {
      activities.value = result
    } else if (result && Array.isArray(result.list)) {
      activities.value = result.list
    } else if (result && Array.isArray(result.data)) {
      activities.value = result.data
    } else if (result && result.data && Array.isArray(result.data.list)) {
      activities.value = result.data.list
    } else {
      activities.value = []
    }
    console.log('加载的活动列表:', activities.value)
  } catch (error) {
    console.error('加载活动列表失败:', error)
    ElMessage.error(error?.message || '加载活动列表失败')
    activities.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  loadActivities()
}

const handleReset = () => {
  searchForm.approvalStatus = 'PENDING'
  searchForm.keyword = ''
  loadActivities()
}

const handleView = (id) => {
  router.push(`/activities/${id}`)
}

const handleEdit = (id) => {
  router.push(`/activities/${id}/edit`)
}

const handleReview = (activity, action) => {
  currentActivity.value = activity
  reviewAction.value = action
  // 根据活动状态判断是初审还是终审
  if (activity.status === 'SUBMITTED' && activity.approvalStatus === 'PENDING') {
    // 初审：已提交且待审批的活动
    reviewType.value = 'college'
  } else if (activity.status === 'APPROVED' && activity.approvalStatus === 'PENDING') {
    // 终审：学院已通过的活动
    reviewType.value = 'school'
  } else {
    // 默认使用初审
    reviewType.value = 'college'
  }
  reviewForm.reviewComment = ''
  reviewDialogVisible.value = true
}

const handleSubmitReview = async () => {
  // 拒绝时必须填写审批意见
  if (reviewAction.value === 'REJECTED' && !reviewForm.reviewComment?.trim()) {
    ElMessage.warning('拒绝时请填写审批意见')
    return
  }
  
  reviewing.value = true
  try {
    if (reviewType.value === 'college') {
      await collegeReview(currentActivity.value.id, {
        approvalStatus: reviewAction.value,
        reviewComment: reviewForm.reviewComment || ''
      })
    } else {
      await schoolReview(currentActivity.value.id, {
        approvalStatus: reviewAction.value,
        reviewComment: reviewForm.reviewComment || ''
      })
    }
    ElMessage.success('审批完成')
    reviewDialogVisible.value = false
    loadActivities()
  } catch (error) {
    ElMessage.error(error?.message || '审批失败')
  } finally {
    reviewing.value = false
  }
}

onMounted(() => {
  loadActivities()
})
</script>

<style scoped>
.activity-review {
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
