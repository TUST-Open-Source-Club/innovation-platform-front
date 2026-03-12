<template>
  <div class="my-registrations">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的报名</span>
          <el-button @click="loadRegistrations" :loading="loading" size="small">刷新</el-button>
        </div>
      </template>

      <el-table :data="registrations" v-loading="loading" style="width: 100%">
        <el-table-column prop="activityTitle" label="活动标题" show-overflow-tooltip min-width="200" />
        <el-table-column prop="activityStartTime" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.activityStartTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="activityLocation" label="活动地点" width="150" />
        <el-table-column prop="status" label="报名状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approvalStatus" label="审批状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getApprovalStatusType(row.approvalStatus)">{{ getApprovalStatusText(row.approvalStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="报名时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewActivity(row.activityId)">查看活动</el-button>
            <el-button
              v-if="canCancel(row)"
              link
              type="danger"
              @click="handleCancel(row)"
            >
              取消报名
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && registrations.length === 0" description="暂无报名记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyRegistrations, cancelRegistration } from '@/api/modules/activity'
import { formatDateTime } from '@/utils/format'

const router = useRouter()

const registrations = ref([])
const loading = ref(false)

const getStatusText = (status) => {
  const statusMap = {
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
    CANCELLED: '已取消'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const statusMap = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    CANCELLED: 'info'
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

const loadRegistrations = async () => {
  loading.value = true
  try {
    const data = await getMyRegistrations()
    // 处理返回数据，可能需要关联活动信息
    if (Array.isArray(data)) {
      registrations.value = data
    } else {
      registrations.value = []
    }
  } catch (error) {
    console.error('加载报名列表失败:', error)
    ElMessage.error(error?.message || '加载报名列表失败')
    registrations.value = []
  } finally {
    loading.value = false
  }
}

const handleViewActivity = (activityId) => {
  router.push(`/activities/${activityId}`)
}

// 判断是否可以取消报名
const canCancel = (row) => {
  // 只有已通过且未取消的报名可以取消
  return row.status === 'APPROVED'
}

const handleCancel = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消报名吗？\n活动：${row.activityTitle || '未知活动'}`,
      '确认取消',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await cancelRegistration(row.id)
    ElMessage.success('报名已取消')
    loadRegistrations() // 重新加载列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '取消报名失败')
    }
  }
}

onMounted(() => {
  loadRegistrations()
})
</script>

<style scoped>
.my-registrations {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
