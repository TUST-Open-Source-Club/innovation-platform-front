<template>
  <div class="activity-management">
    <!-- 学院管理员：活动列表 + 活动总结 两个标签页 -->
    <el-tabs v-if="isCollegeAdmin" v-model="activeTab" type="card" class="activity-tabs">
      <el-tab-pane label="活动列表" name="list">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>活动管理</span>
              <el-button type="primary" @click="handleCreate">创建活动</el-button>
            </div>
          </template>
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="关键词">
              <el-input v-model="searchForm.keyword" placeholder="搜索活动标题或描述" clearable @keyup.enter="handleSearch" />
            </el-form-item>
            <!-- 状态筛选仅学院/学校管理员可见：草稿 / 已提交 / 已通过 / 未通过 -->
            <el-form-item v-if="isAdmin" label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="选择状态"
                clearable
                filterable
              >
                <el-option label="草稿" value="DRAFT" />
                <el-option label="已提交" value="SUBMITTED" />
                <el-option label="已通过" value="APPROVED" />
                <el-option label="未通过" value="REJECTED" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="tableData" v-loading="loading" style="width: 100%">
            <el-table-column prop="title" label="活动标题" />
            <el-table-column prop="organizerName" label="组织者" />
            <el-table-column prop="startTime" label="开始时间">
              <template #default="{ row }">{{ formatDateTime(row.startTime) }}</template>
            </el-table-column>
            <el-table-column prop="location" label="地点" />
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
            <el-table-column label="操作" width="300">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleView(row.id)">查看</el-button>
                <el-button v-if="(row.status === 'DRAFT' && isMyActivity(row)) || isAdmin" link type="primary" @click="handleEdit(row.id)">编辑</el-button>
                <el-button v-if="row.status === 'DRAFT' && isMyActivity(row)" link type="success" @click="handleSubmit(row.id)">提交</el-button>
                <el-button v-if="row.status === 'PUBLISHED' && isMyActivity(row)" link type="warning" @click="handleSummary(row.id)">总结</el-button>
                <el-button v-if="canDelete(row)" link type="danger" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="size"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            style="margin-top: 20px; justify-content: flex-end"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="活动总结" name="summaries">
        <ActivitySummaryList v-if="activeTab === 'summaries'" />
      </el-tab-pane>
    </el-tabs>
    <!-- 非学院管理员：仅活动列表 -->
    <el-card v-else>
      <template #header>
        <div class="card-header">
          <span>活动管理</span>
          <el-button type="primary" @click="handleCreate">创建活动</el-button>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="搜索活动标题或描述" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <!-- 非学院管理员不显示状态筛选；管理员状态筛选仅包含：草稿 / 已提交 / 已通过 / 未通过 -->
        <el-form-item v-if="isAdmin" label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="选择状态"
            clearable
            filterable
          >
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已提交" value="SUBMITTED" />
            <el-option label="已通过" value="APPROVED" />
            <el-option label="未通过" value="REJECTED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="活动标题" />
        <el-table-column prop="organizerName" label="组织者" />
        <el-table-column prop="startTime" label="开始时间">
          <template #default="{ row }">{{ formatDateTime(row.startTime) }}</template>
        </el-table-column>
        <el-table-column prop="location" label="地点" />
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
        <el-table-column label="操作" width="300">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row.id)">查看</el-button>
            <el-button v-if="(row.status === 'DRAFT' && isMyActivity(row)) || isAdmin" link type="primary" @click="handleEdit(row.id)">编辑</el-button>
            <el-button v-if="row.status === 'DRAFT' && isMyActivity(row)" link type="success" @click="handleSubmit(row.id)">提交</el-button>
            <el-button v-if="row.status === 'PUBLISHED' && isMyActivity(row)" link type="warning" @click="handleSummary(row.id)">总结</el-button>
            <el-button v-if="canDelete(row)" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getActivities, submitActivity, deleteActivity } from '@/api/modules/activity'
import { useTable } from '@/composables/useTable'
import { usePermission } from '@/composables/usePermission'
import { useUserStore } from '@/stores/user'
import { STATUS_TEXT, STATUS_TYPE } from '@/constants'
import { formatDateTime } from '@/utils/format'
import ActivitySummaryList from './components/ActivitySummaryList.vue'

const router = useRouter()
const userStore = useUserStore()
const { isAdmin, isCollegeAdmin } = usePermission()

const activeTab = ref('list')

const searchForm = reactive({
  keyword: '',
  status: ''
})

const { tableData, loading, page, size, total, loadData, handlePageChange, handleSizeChange } = useTable(
  async (params) => {
    const result = await getActivities({
      ...params,
      ...searchForm
    })
    return result
  },
  { immediate: true }
)

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

const isMyActivity = (activity) => {
  return activity.organizerId === userStore.user?.id
}

const handleCreate = () => {
  router.push('/activities/create')
}

const handleView = (id) => {
  router.push(`/activities/${id}`)
}

const handleEdit = (id) => {
  router.push(`/activities/${id}/edit`)
}

const handleSubmit = async (id) => {
  try {
    await ElMessageBox.confirm('确定要提交此活动吗？提交后将进入审核流程。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await submitActivity(id)
    ElMessage.success('活动已提交')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '提交失败')
    }
  }
}

const handleSummary = (id) => {
  router.push(`/activities/${id}/summary`)
}

const handleSearch = () => {
  page.value = 1
  loadData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  handleSearch()
}

/**
 * 判断是否可以删除活动
 * 规则：组织者本人或管理员可以删除，但进行中/已完成的活动不能删除
 */
const canDelete = (row) => {
  // 只有组织者本人或管理员可以删除
  const hasPermission = isMyActivity(row) || isAdmin.value
  if (!hasPermission) return false

  // 进行中(ONGOING)或已完成(COMPLETED)的活动不能删除
  if (row.status === 'ONGOING' || row.status === 'COMPLETED') return false

  return true
}

/**
 * 删除活动
 */
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除活动"${row.title}"吗？删除后将无法恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await deleteActivity(row.id)
    ElMessage.success('活动已删除')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}
</script>

<style scoped>
.activity-management {
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

.activity-tabs :deep(.el-tabs__content) {
  padding: 0;
}

.activity-tabs :deep(.el-tab-pane) {
  padding: 0;
}
</style>
