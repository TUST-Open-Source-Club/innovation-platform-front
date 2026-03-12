<template>
  <div class="project-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑项目' : '创建项目' }}</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        style="max-width: 800px"
      >
        <el-form-item label="项目标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入项目标题" />
        </el-form-item>
        <el-form-item label="项目类别" prop="category">
          <el-input v-model="formData.category" placeholder="请输入项目类别" />
        </el-form-item>
        <el-form-item label="指导老师" prop="instructorName">
          <el-input v-model="formData.instructorName" placeholder="请输入指导老师姓名" clearable />
        </el-form-item>
        <el-form-item label="关联团队" prop="teamId">
          <el-select
            v-model="formData.teamId"
            placeholder="选择关联团队（项目负责人为队长的团队）"
            clearable
            style="width: 100%"
          >
            <el-option label="不关联团队" :value="null" />
            <el-option
              v-for="t in myTeams"
              :key="t.id"
              :label="t.name"
              :value="t.id"
            />
          </el-select>
          <div class="form-tip">关联后，项目详情将展示该团队及队员信息；团队详情将展示本项目。</div>
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="6"
            placeholder="请输入项目描述"
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="formData.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="formData.endTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
            :disabled-date="disableEndTime"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存草稿</el-button>
          <el-button type="success" :loading="submitting" @click="handleSubmit" v-if="!isEdit || formData.status === 'DRAFT'">提交审核</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createProject, updateProject, submitProject, getProjectById } from '@/api/modules/project'
import { getMyTeams } from '@/api/modules/team'
import { useForm } from '@/composables/useForm'
import { formatDateTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const isEdit = ref(false)
const saving = ref(false)
const submitting = ref(false)

const { formRef, formData, submitForm, resetForm } = useForm({
  title: '',
  category: '',
  description: '',
  instructorName: '',
  teamId: null,
  startTime: null,
  endTime: null
})

const myTeams = ref([])

const formRules = {
  title: [{ required: true, message: '请输入项目标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入项目描述', trigger: 'blur' }],
  endTime: [
    {
      validator: (rule, value, callback) => {
        if (!value) return callback()
        const end = new Date(value)
        if (Number.isNaN(end.getTime())) return callback(new Error('结束时间格式不正确'))
        if (formData.startTime) {
          const start = new Date(formData.startTime)
          if (!Number.isNaN(start.getTime()) && end.getTime() < start.getTime()) {
            return callback(new Error('结束时间不得早于开始时间'))
          }
        }
        // 创建时：不允许小于当前时间；编辑时：不允许小于项目创建时间（后端也会强校验）
        const min = isEdit.value ? null : new Date()
        if (min && end.getTime() < min.getTime()) return callback(new Error('结束时间不能小于创建时间'))
        return callback()
      },
      trigger: 'change'
    }
  ],
  startTime: [
    {
      validator: (rule, value, callback) => {
        if (!value) return callback()
        const start = new Date(value)
        if (Number.isNaN(start.getTime())) return callback(new Error('开始时间格式不正确'))
        if (formData.endTime) {
          const end = new Date(formData.endTime)
          if (!Number.isNaN(end.getTime()) && end.getTime() < start.getTime()) {
            return callback(new Error('开始时间不得晚于结束时间'))
          }
        }
        return callback()
      },
      trigger: 'change'
    }
  ]
}

const disableEndTime = (date) => {
  if (!date) return false
  if (formData.startTime) {
    const start = new Date(formData.startTime)
    if (!Number.isNaN(start.getTime()) && date.getTime() < start.getTime()) return true
  }
  // 创建时限制：结束时间不能小于当前时间（创建时间=当前时间）
  if (!isEdit.value) {
    return date.getTime() < Date.now()
  }
  // 编辑时不做前端硬限制（由后端以 createTime 为准校验）
  return false
}

const goBack = () => {
  router.back()
}

const handleSave = async () => {
  const success = await submitForm(async (data) => {
    saving.value = true
    try {
      if (isEdit.value) {
        await updateProject(route.params.id, data)
        ElMessage.success('项目更新成功')
      } else {
        await createProject(data)
        ElMessage.success('项目创建成功')
      }
      router.push('/projects')
    } catch (error) {
      ElMessage.error(error?.message || '保存失败')
      throw error
    } finally {
      saving.value = false
    }
  }, { showSuccessMessage: false })
}

const handleSubmit = async () => {
  const success = await submitForm(async (data) => {
    submitting.value = true
    try {
      if (isEdit.value && formData.status === 'DRAFT') {
        // 先更新，再提交
        await updateProject(route.params.id, data)
        await submitProject(route.params.id)
      } else if (!isEdit.value) {
        // 先创建，再提交
        const project = await createProject(data)
        await submitProject(project.id)
      } else {
        ElMessage.warning('只能提交草稿状态的项目')
        return
      }
      ElMessage.success('项目已提交审核')
      router.push('/projects')
    } catch (error) {
      ElMessage.error(error?.message || '提交失败')
      throw error
    } finally {
      submitting.value = false
    }
  }, { showSuccessMessage: false })
}

const loadProject = async () => {
  const id = route.params.id
  if (id) {
    isEdit.value = true
    try {
      const project = await getProjectById(id)
      if (!project) {
        ElMessage.error('项目不存在')
        router.push('/projects')
        return
      }
      Object.assign(formData, {
        title: project.title,
        category: project.category,
        description: project.description,
        instructorName: project.instructorName ?? '',
        teamId: project.teamId ?? null,
        startTime: project.startTime,
        endTime: project.endTime
      })
      // 保存项目状态，用于判断是否可以提交
      formData.status = project.status
    } catch (error) {
      ElMessage.error(error?.message || '加载项目信息失败')
      router.push('/projects')
    }
  } else {
    isEdit.value = false
    resetForm()
  }
}

// 路由变化时重新加载（解决组件复用时 onMounted 不触发的问题）
watch(() => route.params.id, (newId) => {
  loadProject()
}, { immediate: false })

onMounted(async () => {
  loadProject()
  try {
    myTeams.value = await getMyTeams() || []
  } catch {
    myTeams.value = []
  }
})
</script>

<style scoped>
.project-form {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
</style>
