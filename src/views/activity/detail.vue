<template>
  <div class="activity-detail" v-loading="loading">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ activity?.title }}</span>
          <div>
            <el-button @click="goBack">返回</el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="活动标题">{{ activity?.title }}</el-descriptions-item>
        <el-descriptions-item label="活动类型">
          {{ activity?.activityTypeName || activity?.activityTypeOther || '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="活动系列">
          {{ activity?.activitySeries || '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="组织者">{{ activity?.organizerName }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ formatDateTime(activity?.startTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="结束时间">
          {{ formatDateTime(activity?.endTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="活动地点">{{ activity?.location }}</el-descriptions-item>
        <el-descriptions-item label="主办单位">
          {{ hostUnitName || '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="承办单位">
          {{ coOrganizerNames || '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="其他单位" :span="2">
          {{ activity?.otherUnits || '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getActivityDisplayStatusType(activity)">{{ getActivityDisplayStatusText(activity) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审批状态">
          <el-tag :type="getActivityDisplayApprovalType(activity)">{{ getActivityDisplayApprovalText(activity) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="报名二维码" :span="2">
          <template v-if="activity?.qrCodeUrl">
            <el-image
              :src="activity.qrCodeUrl"
              :preview-src-list="[activity.qrCodeUrl]"
              style="width: 120px; height: 120px; cursor: pointer"
              fit="contain"
            />
          </template>
          <span v-else>—</span>
        </el-descriptions-item>
        <el-descriptions-item label="活动海报" :span="2">
          <template v-if="activity?.posterUrl">
            <el-image
              :src="activity.posterUrl"
              :preview-src-list="[activity.posterUrl]"
              style="width: 160px; height: 220px; cursor: pointer"
              fit="cover"
            />
          </template>
          <span v-else>—</span>
        </el-descriptions-item>
        <el-descriptions-item label="活动描述" :span="2">
          {{ activity?.description }}
        </el-descriptions-item>
        <el-descriptions-item label="活动内容" :span="2">
          <div style="white-space: pre-wrap">{{ activity?.content }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getActivityById, registerActivity } from '@/api/modules/activity'
import { getColleges } from '@/api/modules/common'
import { useUserStore } from '@/stores/user'
import { STATUS_TEXT, STATUS_TYPE } from '@/constants'
import { formatDateTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activity = ref(null)
const colleges = ref([])
const loading = ref(false)
const registerDialogVisible = ref(false)
const registering = ref(false)

const registerForm = ref({
  name: '',
  studentId: '',
  phone: '',
  remark: ''
})

const getCollegeNameById = (id) => {
  if (!id || !Array.isArray(colleges.value)) return ''
  const found = colleges.value.find(c => String(c.id) === String(id))
  return found ? found.name : ''
}

const hostUnitName = computed(() => {
  if (!activity.value?.hostUnitId) return ''
  return getCollegeNameById(activity.value.hostUnitId)
})

const coOrganizerNames = computed(() => {
  const ids = activity.value?.coOrganizerIds
  if (!ids || typeof ids !== 'string') return ''
  const list = ids.split(',').map(s => s.trim()).filter(Boolean)
  if (!list.length) return ''
  const names = list.map(id => getCollegeNameById(id) || id)
  return names.join('、')
})

const canRegister = computed(() => {
  return (
    activity.value?.status === 'PUBLISHED' &&
    activity.value?.approvalStatus === 'APPROVED' &&
    (!activity.value?.maxParticipants || 
     (activity.value?.registeredCount || 0) < activity.value?.maxParticipants)
  )
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

const goBack = () => {
  router.back()
}

const loadActivity = async () => {
  loading.value = true
  try {
    activity.value = await getActivityById(route.params.id)
    // 填充报名表单默认值
    if (userStore.user) {
      registerForm.value.name = userStore.user.realName || ''
      registerForm.value.phone = userStore.user.phone || ''
    }
  } catch (error) {
    ElMessage.error('加载活动详情失败')
  } finally {
    loading.value = false
  }
}

const handleRegister = () => {
  registerDialogVisible.value = true
}

const handleSubmitRegister = async () => {
  if (!registerForm.value.name || !registerForm.value.phone) {
    ElMessage.warning('请填写姓名和联系电话')
    return
  }

  registering.value = true
  try {
    await registerActivity(route.params.id, registerForm.value)
    ElMessage.success('报名成功')
    registerDialogVisible.value = false
    loadActivity()
  } catch (error) {
    ElMessage.error(error.message || '报名失败')
  } finally {
    registering.value = false
  }
}

const loadColleges = async () => {
  try {
    const list = await getColleges()
    colleges.value = Array.isArray(list) ? list : []
  } catch {
    colleges.value = []
  }
}

onMounted(() => {
  loadColleges()
  loadActivity()
})
</script>

<style scoped>
.activity-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
