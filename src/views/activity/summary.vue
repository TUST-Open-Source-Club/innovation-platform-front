<template>
  <div class="activity-summary">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>活动总结</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <!-- 已通过：不可再操作 -->
      <div v-if="summaryStatus === 'APPROVED'" class="status-tip success">
        <el-alert type="success" show-icon :closable="false">
          该活动总结已通过，无需再提交。
        </el-alert>
      </div>

      <!-- 待审批：不可二次提交，驳回后可再提交 -->
      <div v-else-if="summaryStatus === 'PENDING'" class="status-tip warning">
        <el-alert type="warning" show-icon :closable="false">
          已提交总结，待学院管理员审批，驳回后可再次提交。
        </el-alert>
      </div>

      <!-- 可提交：无总结或已驳回 -->
      <template v-else>
        <div v-if="summaryStatus === 'REJECTED' && existingSummary?.reviewComment" class="status-tip info">
          <el-alert type="info" show-icon :closable="false">
            驳回意见：{{ existingSummary.reviewComment }}
          </el-alert>
        </div>
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="120px"
          style="max-width: 800px"
        >
          <el-form-item label="活动标题">
            <span>{{ activity?.title }}</span>
          </el-form-item>
          <el-form-item label="实际参与人数" prop="actualParticipants">
            <el-input-number v-model="formData.actualParticipants" :min="0" />
          </el-form-item>
          <el-form-item label="活动总结" prop="summaryContent">
            <el-input
              v-model="formData.summaryContent"
              type="textarea"
              :rows="6"
              placeholder="请输入活动总结内容"
            />
          </el-form-item>
          <el-form-item label="活动成果" prop="achievements">
            <el-input
              v-model="formData.achievements"
              type="textarea"
              :rows="4"
              placeholder="请输入活动成果"
            />
          </el-form-item>
          <el-form-item label="活动照片">
            <el-upload
              v-model:file-list="photoList"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :limit="9"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="附件">
            <el-upload
              v-model:file-list="attachmentList"
              action="#"
              :auto-upload="false"
              :limit="5"
            >
              <el-button type="primary">选择文件</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">提交总结</el-button>
            <el-button @click="goBack">取消</el-button>
          </el-form-item>
        </el-form>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getActivityById, submitActivitySummary, getActivitySummary } from '@/api/modules/activity'
import { uploadFile } from '@/api/modules/upload'
import { useForm } from '@/composables/useForm'

const route = useRoute()
const router = useRouter()

const activity = ref(null)
const submitting = ref(false)
const photoList = ref([])
const attachmentList = ref([])
const existingSummary = ref(null) // 当前活动已有总结（用于 PENDING/APPROVED/REJECTED 展示）

const { formRef, formData, submitForm } = useForm({
  actualParticipants: 0,
  summaryContent: '',
  achievements: ''
})

const formRules = {
  actualParticipants: [{ required: true, message: '请输入实际参与人数', trigger: 'blur' }],
  summaryContent: [{ required: true, message: '请输入活动总结', trigger: 'blur' }]
}

/** 总结状态：无 / PENDING / APPROVED / REJECTED，用于控制是否显示表单与提交按钮 */
const summaryStatus = computed(() => {
  const s = existingSummary.value
  if (!s) return null
  return s.approvalStatus || null
})

const goBack = () => {
  router.back()
}

const handleSubmit = async () => {
  const success = await submitForm(async (data) => {
    submitting.value = true
    try {
      const photos = []
      for (const file of photoList.value) {
        const raw = file.raw || file
        if (raw && raw instanceof File) {
          const url = await uploadFile(raw, 'activity-summary-photo')
          if (url) photos.push(url)
        } else if (file.url && (file.url.startsWith('http://') || file.url.startsWith('https://'))) {
          photos.push(file.url)
        }
      }
      const attachmentItems = []
      for (const file of attachmentList.value) {
        const raw = file.raw || file
        if (raw && raw instanceof File) {
          const url = await uploadFile(raw, 'activity-summary-attachment')
          if (url) attachmentItems.push({ name: raw.name, url })
        }
      }
      await submitActivitySummary(route.params.id, {
        ...data,
        photos: JSON.stringify(photos),
        attachments: JSON.stringify(attachmentItems)
      })
      ElMessage.success('总结提交成功')
      router.push('/activities')
    } catch (e) {
      ElMessage.error(e?.message || '提交失败')
    } finally {
      submitting.value = false
    }
  })
}

const loadActivity = async () => {
  try {
    activity.value = await getActivityById(route.params.id)
  } catch (error) {
    ElMessage.error('加载活动信息失败')
  }
}

const loadSummary = async () => {
  try {
    const res = await getActivitySummary(route.params.id)
    existingSummary.value = res ?? null
  } catch {
    existingSummary.value = null
  }
}

onMounted(async () => {
  await loadActivity()
  await loadSummary()
})
</script>

<style scoped>
.activity-summary {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-tip {
  margin-bottom: 16px;
}
.status-tip.success,
.status-tip.warning,
.status-tip.info {
  max-width: 800px;
}
</style>
