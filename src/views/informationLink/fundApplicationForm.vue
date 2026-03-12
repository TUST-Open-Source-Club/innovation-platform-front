<template>
  <div class="fund-application-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑基金申请' : '创建基金申请' }}</span>
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
        <el-form-item label="申请标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入申请标题" />
        </el-form-item>
        <el-form-item label="关联项目" prop="projectId">
          <el-select
            v-model="formData.projectId"
            placeholder="请选择关联项目"
            filterable
            style="width: 100%"
            :loading="loadingProjects"
          >
            <el-option
              v-for="project in projects"
              :key="project.id"
              :label="project.title"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="基金类型" prop="fundTypeId">
          <el-select
            v-model="formData.fundTypeId"
            placeholder="请选择基金类型"
            style="width: 100%"
            :loading="loadingFundTypes"
          >
            <el-option
              v-for="type in fundTypes"
              :key="type.id"
              :label="`${type.name}${type.maxAmount ? ' (最高' + formatAmount(type.maxAmount) + ')' : ''}`"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="申请金额" prop="applicationAmount">
          <el-input-number
            v-model="formData.applicationAmount"
            :min="0"
            :precision="2"
            :step="1000"
            placeholder="请输入申请金额"
            style="width: 100%"
          />
          <div style="color: #909399; font-size: 12px; margin-top: 5px;">
            单位：元
          </div>
        </el-form-item>
        <el-form-item label="申请理由" prop="applicationReason">
          <el-input
            v-model="formData.applicationReason"
            type="textarea"
            :rows="4"
            placeholder="请输入申请理由"
          />
        </el-form-item>
        <el-form-item label="申请内容" prop="applicationContent">
          <el-input
            v-model="formData.applicationContent"
            type="textarea"
            :rows="6"
            placeholder="请输入申请内容，包括项目背景、实施方案等"
          />
        </el-form-item>
        <el-form-item label="预期成果" prop="expectedOutcomes">
          <el-input
            v-model="formData.expectedOutcomes"
            type="textarea"
            :rows="4"
            placeholder="请输入预期成果"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { formatAmount } from '@/utils/format'
import { createFundApplication, getFundApplicationById } from '@/api/modules/fundApplication'
import { getFundTypes } from '@/api/modules/fundApplication'
import { getMyProjects } from '@/api/modules/project'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)
const loadingProjects = ref(false)
const loadingFundTypes = ref(false)
const projects = ref([])
const fundTypes = ref([])

const formData = ref({
  title: '',
  projectId: null,
  fundTypeId: null,
  applicationAmount: null,
  applicationReason: '',
  applicationContent: '',
  expectedOutcomes: '',
  attachments: null
})

const formRules = {
  title: [{ required: true, message: '请输入申请标题', trigger: 'blur' }],
  projectId: [{ required: true, message: '请选择关联项目', trigger: 'change' }],
  fundTypeId: [{ required: true, message: '请选择基金类型', trigger: 'change' }],
  applicationAmount: [
    { required: true, message: '请输入申请金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '申请金额必须大于0', trigger: 'blur' }
  ],
  applicationReason: [{ required: true, message: '请输入申请理由', trigger: 'blur' }],
  applicationContent: [{ required: true, message: '请输入申请内容', trigger: 'blur' }],
  expectedOutcomes: [{ required: true, message: '请输入预期成果', trigger: 'blur' }]
}

const goBack = () => {
  router.back()
}

const loadProjects = async () => {
  loadingProjects.value = true
  try {
    const data = await getMyProjects()
    if (Array.isArray(data)) {
      projects.value = data.filter(p => p.status === 'APPROVED' || p.status === 'IN_PROGRESS')
    } else if (data && Array.isArray(data.list)) {
      projects.value = data.list.filter(p => p.status === 'APPROVED' || p.status === 'IN_PROGRESS')
    } else {
      projects.value = []
    }
  } catch (error) {
    ElMessage.error('加载项目列表失败')
    projects.value = []
  } finally {
    loadingProjects.value = false
  }
}

const loadFundTypes = async () => {
  loadingFundTypes.value = true
  try {
    fundTypes.value = await getFundTypes() || []
  } catch (error) {
    ElMessage.error('加载基金类型失败')
    fundTypes.value = []
  } finally {
    loadingFundTypes.value = false
  }
}

const loadApplication = async () => {
  if (!isEdit.value) return
  try {
    const data = await getFundApplicationById(route.params.id)
    if (data) {
      formData.value = {
        title: data.title || '',
        projectId: data.projectId || null,
        fundTypeId: data.fundTypeId || null,
        applicationAmount: data.applicationAmount || null,
        applicationReason: data.applicationReason || '',
        applicationContent: data.applicationContent || '',
        expectedOutcomes: data.expectedOutcomes || '',
        attachments: data.attachments || null
      }
    }
  } catch (error) {
    ElMessage.error('加载申请信息失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (isEdit.value) {
        // TODO: 实现更新API
        ElMessage.success('更新成功')
      } else {
        await createFundApplication(formData.value)
        ElMessage.success('创建成功')
      }
      router.push('/fund-applications')
    } catch (error) {
      ElMessage.error(error?.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

onMounted(async () => {
  await Promise.all([loadProjects(), loadFundTypes()])
  if (isEdit.value) {
    await loadApplication()
  }
})
</script>

<style scoped>
.fund-application-form {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
