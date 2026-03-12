<template>
  <el-dialog
    v-model="visible"
    title="申请加入团队"
    width="560px"
    :close-on-click-modal="false"
    @close="reset"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="姓名" prop="realName">
        <el-input v-model="form.realName" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="学号" prop="studentId">
        <el-input v-model="form.studentId" placeholder="请输入学号" />
      </el-form-item>
      <el-form-item label="年级" prop="grade">
        <el-input v-model="form.grade" placeholder="如：2022级" />
      </el-form-item>
      <el-form-item label="专业" prop="major">
        <el-input v-model="form.major" placeholder="请输入专业" />
      </el-form-item>
      <el-form-item label="手机号" prop="contactPhone">
        <el-input v-model="form.contactPhone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="比赛经历" prop="competitionExperience">
        <el-input v-model="form.competitionExperience" type="textarea" :rows="3" placeholder="请简要填写比赛经历" />
      </el-form-item>
      <el-form-item label="获奖情况" prop="awards">
        <el-input v-model="form.awards" type="textarea" :rows="3" placeholder="请简要填写获奖情况" />
      </el-form-item>
      <el-form-item label="简历附件">
        <el-upload
          :auto-upload="false"
          :limit="1"
          :on-change="onFileChange"
          :on-remove="onFileRemove"
          accept=".pdf,.doc,.docx"
        >
          <el-button type="primary" size="small">选择文件（简历 PDF/Word）</el-button>
        </el-upload>
        <div v-if="uploading" class="upload-tip">正在上传...</div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">提交申请</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { applyJoinTeam } from '@/api/modules/informationLink'
import { uploadFile } from '@/api/modules/upload'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  teamId: { type: Number, default: null },
  teamName: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const formRef = ref(null)
const submitting = ref(false)
const uploading = ref(false)
const resumeFile = ref(null)

const form = reactive({
  realName: '',
  studentId: '',
  grade: '',
  major: '',
  contactPhone: '',
  competitionExperience: '',
  awards: ''
})

const rules = {
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

watch(
  () => props.modelValue,
  val => {
    visible.value = val
  },
  { immediate: true }
)

watch(visible, val => {
  emit('update:modelValue', val)
})

function onFileChange(file) {
  resumeFile.value = file.raw
}

function onFileRemove() {
  resumeFile.value = null
}

function reset() {
  form.realName = ''
  form.studentId = ''
  form.grade = ''
  form.major = ''
  form.contactPhone = ''
  form.competitionExperience = ''
  form.awards = ''
  resumeFile.value = null
  formRef.value?.resetFields()
}

const open = () => {
  visible.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    let resumeAttachment = ''
    if (resumeFile.value) {
      uploading.value = true
      try {
        resumeAttachment = await uploadFile(resumeFile.value)
      } finally {
        uploading.value = false
      }
    }
    const payload = {
      realName: form.realName,
      studentId: form.studentId,
      grade: form.grade,
      major: form.major,
      contactPhone: form.contactPhone,
      competitionExperience: form.competitionExperience,
      awards: form.awards
    }
    if (resumeAttachment) payload.resumeAttachment = resumeAttachment
    await applyJoinTeam(props.teamId, payload)
    ElMessage.success('申请已提交，请等待队长审批')
    visible.value = false
    emit('success')
  } catch (e) {
    if (e?.message) ElMessage.error(e.message)
  } finally {
    submitting.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.upload-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
</style>
