<template>
  <div class="team-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑团队' : '创建团队' }}</span>
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
        <el-form-item label="团队名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入团队名称" />
        </el-form-item>
        <el-form-item label="团队类型" prop="teamType">
          <el-select v-model="formData.teamType" placeholder="选择团队类型" clearable style="width: 100%">
            <el-option label="创新团队" value="INNOVATION" />
            <el-option label="创业团队" value="STARTUP" />
            <el-option label="科研团队" value="RESEARCH" />
          </el-select>
        </el-form-item>
        <el-form-item label="团队描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="6"
            placeholder="请输入团队描述"
          />
        </el-form-item>
        <el-form-item label="指导老师" prop="instructorName">
          <el-input v-model="formData.instructorName" placeholder="请输入指导老师" />
        </el-form-item>
        <el-form-item label="负责人学号" prop="leaderStudentId">
          <el-input v-model="formData.leaderStudentId" placeholder="请输入负责人学号" />
        </el-form-item>
        <el-form-item label="学院" prop="collegeName">
          <el-input v-model="formData.collegeName" placeholder="请输入学院名" />
        </el-form-item>
        <el-form-item label="是否招募" prop="recruiting">
          <el-switch v-model="formData.recruiting" />
          <span class="form-switch-label">{{ formData.recruiting ? '正在招募' : '未招募' }}</span>
        </el-form-item>
        <el-form-item v-if="formData.recruiting" label="招募要求" prop="recruitmentRequirement">
          <el-input
            v-model="formData.recruitmentRequirement"
            type="textarea"
            :rows="4"
            placeholder="开启招募时必填"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useForm } from '@/composables/useForm'
import { getTeamById, createTeam, updateTeam } from '@/api/modules/team'

const route = useRoute()
const router = useRouter()

const isEdit = ref(false)
const saving = ref(false)

const { formRef, formData, validateForm } = useForm({
  name: '',
  teamType: '',
  description: '',
  instructorName: '',
  leaderStudentId: '',
  collegeName: '',
  recruiting: false,
  recruitmentRequirement: ''
})

const formRules = {
  name: [{ required: true, message: '请输入团队名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入团队描述', trigger: 'blur' }],
  recruitmentRequirement: [
    {
      validator: (rule, value, callback) => {
        if (formData.recruiting && !(value && value.trim())) {
          callback(new Error('开启招募时，招募要求不能为空'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const goBack = () => {
  router.back()
}

const handleSave = async () => {
  const valid = await validateForm()
  if (!valid) return
  saving.value = true
  try {
    const id = route.params.id
    const payload = {
      name: formData.name,
      teamType: formData.teamType || null,
      description: formData.description || null,
      instructorName: formData.instructorName || null,
      leaderStudentId: formData.leaderStudentId || null,
      collegeName: formData.collegeName || null,
      recruiting: !!formData.recruiting,
      recruitmentRequirement: formData.recruiting ? (formData.recruitmentRequirement || '').trim() : null
    }
    if (isEdit.value && id) {
      await updateTeam(id, payload)
      ElMessage.success('团队更新成功')
    } else {
      await createTeam(payload)
      ElMessage.success('团队创建成功')
    }
    router.push('/teams')
  } catch (error) {
    ElMessage.error(error?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const id = route.params.id
  if (id) {
    isEdit.value = true
    try {
      const team = await getTeamById(id)
      if (team) {
        formData.name = team.name ?? ''
        formData.teamType = team.teamType ?? ''
        formData.description = team.description ?? ''
        formData.instructorName = team.instructorName ?? ''
        formData.leaderStudentId = team.leaderStudentId ?? ''
        formData.collegeName = team.collegeName ?? ''
        formData.recruiting = !!team.recruiting
        formData.recruitmentRequirement = team.recruitmentRequirement ?? ''
      }
    } catch (e) {
      ElMessage.error(e?.message || '加载团队失败')
      router.push('/teams')
    }
  }
})
</script>

<style scoped>
.team-form {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-switch-label {
  margin-left: 8px;
  color: var(--el-text-color-regular);
}
</style>
