<template>
  <div class="entry-application-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑入驻申请' : '创建入驻申请' }}</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="140px"
        style="max-width: 1000px"
        v-loading="loading"
      >
        <!-- 团队基本信息 -->
        <el-divider>团队基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创新团队名称" prop="teamName">
              <el-input v-model="formData.teamName" placeholder="请输入创新团队名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合作企业">
              <el-input v-model="formData.partnerCompany" placeholder="请输入合作企业名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发起人学号姓名" prop="applicantStudentId">
              <el-input v-model="formData.applicantStudentId" placeholder="请输入学号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发起人联系方式" prop="applicantPhone">
              <el-input v-model="formData.applicantPhone" placeholder="请输入联系方式" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="团队类型" prop="teamType">
          <el-select v-model="formData.teamType" placeholder="选择团队类型" clearable>
            <el-option label="创新团队" value="INNOVATION" />
            <el-option label="创业团队" value="STARTUP" />
            <el-option label="科研团队" value="RESEARCH" />
          </el-select>
        </el-form-item>
        <el-form-item label="创新方向" prop="innovationDirection">
          <el-input v-model="formData.innovationDirection" placeholder="请输入创新方向" />
        </el-form-item>
        <el-form-item label="团队简介" prop="teamDescription">
          <el-input
            v-model="formData.teamDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入团队简介"
          />
        </el-form-item>
        <el-form-item label="团队规模" prop="teamSize">
          <el-input-number v-model="formData.teamSize" :min="1" :max="20" />
          <span style="margin-left: 10px; color: #909399;">人</span>
        </el-form-item>
        <el-form-item label="招募人员的要求" prop="recruitmentRequirements">
          <el-input
            v-model="formData.recruitmentRequirements"
            type="textarea"
            :rows="4"
            placeholder="请输入招募人员的要求（如专业、技能、人数等），通过审核后将展示在团队卡片"
          />
        </el-form-item>

        <!-- 导师信息 -->
        <el-divider>导师信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="指导教师姓名" prop="instructorName">
              <el-input v-model="formData.instructorName" placeholder="请输入指导教师姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="指导教师联系方式" prop="instructorContact">
              <el-input v-model="formData.instructorContact" placeholder="请输入联系方式" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="校内导师姓名">
              <el-input v-model="formData.campusMentorName" placeholder="请输入校内导师姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="校内导师联系方式">
              <el-input v-model="formData.campusMentorContact" placeholder="请输入联系方式" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="企业导师姓名">
              <el-input v-model="formData.enterpriseMentorName" placeholder="请输入企业导师姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业导师联系方式">
              <el-input v-model="formData.enterpriseMentorContact" placeholder="请输入联系方式" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 项目信息 -->
        <el-divider>项目信息</el-divider>
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="formData.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目简介" prop="projectDescription">
          <el-input
            v-model="formData.projectDescription"
            type="textarea"
            :rows="4"
            placeholder="请输入项目简介"
          />
        </el-form-item>
        <el-form-item label="项目成绩">
          <el-input
            v-model="formData.projectAchievements"
            type="textarea"
            :rows="4"
            placeholder="AB类赛事参赛所获最高荣誉奖项，个人、团队或项目在社会、行业、产业等方面所荣获的代表性奖项或荣誉"
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

        <!-- 竞赛信息 -->
        <el-divider>竞赛信息</el-divider>
        <el-form-item label="是否已报名参加竞赛">
          <el-radio-group v-model="formData.isCompetitionRegistered">
            <el-radio :label="0">否</el-radio>
            <el-radio :label="1">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="formData.isCompetitionRegistered === 1"
          label="竞赛名称"
          prop="competitionName"
        >
          <el-input v-model="formData.competitionName" placeholder="请输入竞赛名称（拟报或已报竞赛）" />
        </el-form-item>

        <!-- 项目组成员 -->
        <el-divider>项目组成员（除去团队负责人不超过4人）</el-divider>
        <el-table :data="teamMembers" border style="width: 100%; margin-bottom: 20px">
          <el-table-column label="学号" width="150">
            <template #default="{ row, $index }">
              <el-input v-model="row.studentId" placeholder="学号" />
            </template>
          </el-table-column>
          <el-table-column label="姓名" width="120">
            <template #default="{ row }">
              <el-input v-model="row.name" placeholder="姓名" />
            </template>
          </el-table-column>
          <el-table-column label="专业" width="150">
            <template #default="{ row }">
              <el-input v-model="row.major" placeholder="专业" />
            </template>
          </el-table-column>
          <el-table-column label="主要工作">
            <template #default="{ row }">
              <el-input v-model="row.mainWork" placeholder="主要工作" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ $index }">
              <el-button
                v-if="teamMembers.length > 0"
                link
                type="danger"
                @click="removeTeamMember($index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-form-item>
          <el-button
            type="primary"
            :disabled="teamMembers.length >= 4"
            @click="addTeamMember"
          >
            添加成员（最多4人）
          </el-button>
        </el-form-item>

        <!-- 创新团队定位与建设思路 -->
        <el-divider>创新团队定位与建设思路</el-divider>
        <el-form-item label="详细描述" prop="teamPositioning">
          <el-input
            v-model="formData.teamPositioning"
            type="textarea"
            :rows="8"
            placeholder="1.创新团队建立的意义与前景&#10;2.创新团队建设基础&#10;3.校企联合创新项目规划&#10;4.建设思路和方案等（可续页）"
          />
        </el-form-item>

        <!-- 联系方式 -->
        <el-divider>联系方式</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系邮箱" prop="contactEmail">
              <el-input v-model="formData.contactEmail" placeholder="请输入联系邮箱" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 附件材料 -->
        <el-divider>附件材料</el-divider>
        <el-form-item label="附件">
          <el-upload
            v-model:file-list="fileList"
            action="#"
            :auto-upload="false"
            :limit="10"
            :on-remove="handleRemoveFile"
            :on-change="handleFileChange"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">最多上传10个附件，支持PDF、Word、图片等格式</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存草稿</el-button>
          <el-button type="success" :loading="submitting" @click="handleSubmit">提交审核</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createEntryApplication, updateEntryApplication, submitEntryApplication, getEntryApplicationById } from '@/api/modules/entryApplication'
import { useForm } from '@/composables/useForm'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isEdit = ref(false)
const loading = ref(false)
const saving = ref(false)
const submitting = ref(false)
const fileList = ref([])
const teamMembers = ref([])

const { formRef, formData, submitForm, resetForm } = useForm({
  teamName: '',
  partnerCompany: '',
  applicantStudentId: '',
  applicantPhone: '',
  teamType: '',
  innovationDirection: '',
  teamDescription: '',
  teamSize: null,
  recruitmentRequirements: '',
  instructorName: '',
  instructorContact: '',
  campusMentorName: '',
  campusMentorContact: '',
  enterpriseMentorName: '',
  enterpriseMentorContact: '',
  projectName: '',
  projectDescription: '',
  projectAchievements: '',
  expectedOutcomes: '',
  isCompetitionRegistered: 0,
  competitionName: '',
  teamPositioning: '',
  contactPhone: '',
  contactEmail: '',
  attachments: ''
})

// 核心修改：给applicantStudentId新增字母+数字格式校验
const formRules = {
  teamName: [{ required: true, message: '请输入创新团队名称', trigger: 'blur' }],
  applicantStudentId: [
    { required: true, message: '请输入发起人学号', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9]+$/, message: '学号只能包含大小写字母和数字', trigger: 'blur' }
  ],
  applicantPhone: [
    { required: true, message: '请输入发起人联系方式', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  teamType: [{ required: true, message: '请选择团队类型', trigger: 'change' }],
  innovationDirection: [{ required: true, message: '请输入创新方向', trigger: 'blur' }],
  recruitmentRequirements: [{ required: true, message: '请输入招募人员的要求', trigger: 'blur' }],
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  teamPositioning: [{ required: true, message: '请输入创新团队定位与建设思路', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const goBack = () => {
  router.back()
}

const addTeamMember = () => {
  if (teamMembers.value.length < 4) {
    teamMembers.value.push({
      studentId: '',
      name: '',
      major: '',
      mainWork: ''
    })
  } else {
    ElMessage.warning('最多只能添加4名成员')
  }
}

const removeTeamMember = (index) => {
  teamMembers.value.splice(index, 1)
}

const handleFileChange = (file) => {
  // 文件选择处理
}

const handleRemoveFile = (file) => {
  // 文件移除处理
}

const handleSave = async () => {
  const success = await submitForm(async (data) => {
    // 处理团队成员（JSON格式）
    data.teamMembers = JSON.stringify(teamMembers.value)
    
    // 处理附件
    const attachments = fileList.value.map(file => file.name)
    data.attachments = JSON.stringify(attachments)
    
    // 填充申请人信息
    if (userStore.user) {
      data.applicantName = userStore.user.realName || ''
      if (!data.applicantPhone) {
        data.applicantPhone = userStore.user.phone || ''
      }
    }
    
    saving.value = true
    try {
      if (isEdit.value) {
        await updateEntryApplication(route.params.id, data)
        ElMessage.success('申请已保存')
      } else {
        await createEntryApplication(data)
        ElMessage.success('申请草稿已保存')
      }
      router.push('/teams')
    } catch (error) {
      ElMessage.error(error.message || '保存失败')
    } finally {
      saving.value = false
    }
  }, { showSuccessMessage: false })
}

const handleSubmit = async () => {
  const success = await submitForm(async (data) => {
    // 验证必填字段
    if (teamMembers.value.length === 0) {
      ElMessage.warning('请至少添加一名项目组成员')
      return
    }
    
    // 处理团队成员（JSON格式）
    data.teamMembers = JSON.stringify(teamMembers.value)
    
    // 处理附件
    const attachments = fileList.value.map(file => file.name)
    data.attachments = JSON.stringify(attachments)
    
    // 填充申请人信息
    if (userStore.user) {
      data.applicantName = userStore.user.realName || ''
      if (!data.applicantPhone) {
        data.applicantPhone = userStore.user.phone || ''
      }
    }
    
    submitting.value = true
    try {
      if (isEdit.value) {
        // 先更新，再提交
        await updateEntryApplication(route.params.id, data)
        await submitEntryApplication(route.params.id)
      } else {
        // 先创建，再提交
        const application = await createEntryApplication(data)
        await submitEntryApplication(application.id)
      }
      ElMessage.success('申请已提交审核')
      router.push('/teams')
    } catch (error) {
      ElMessage.error(error.message || '提交失败')
    } finally {
      submitting.value = false
    }
  }, { showSuccessMessage: false })
}

const loadApplication = async () => {
  const id = route.params.id
  if (id) {
    isEdit.value = true
    loading.value = true
    try {
      const application = await getEntryApplicationById(id)
      if (!application) {
        ElMessage.error('申请不存在')
        return
      }
      Object.assign(formData, {
        teamName: application.teamName,
        partnerCompany: application.partnerCompany,
        applicantStudentId: application.applicantStudentId,
        applicantPhone: application.applicantPhone,
        teamType: application.teamType,
        innovationDirection: application.innovationDirection,
        teamDescription: application.teamDescription,
        teamSize: application.teamSize,
        recruitmentRequirements: application.recruitmentRequirements,
        instructorName: application.instructorName,
        instructorContact: application.instructorContact,
        campusMentorName: application.campusMentorName,
        campusMentorContact: application.campusMentorContact,
        enterpriseMentorName: application.enterpriseMentorName,
        enterpriseMentorContact: application.enterpriseMentorContact,
        projectName: application.projectName,
        projectDescription: application.projectDescription,
        projectAchievements: application.projectAchievements,
        expectedOutcomes: application.expectedOutcomes,
        isCompetitionRegistered: application.isCompetitionRegistered || 0,
        competitionName: application.competitionName,
        teamPositioning: application.teamPositioning,
        contactPhone: application.contactPhone,
        contactEmail: application.contactEmail
      })
      
      // 加载团队成员
      if (application.teamMembers) {
        try {
          teamMembers.value = JSON.parse(application.teamMembers)
        } catch (e) {
          console.error('解析团队成员失败', e)
          teamMembers.value = []
        }
      }
      
      // 加载附件
      if (application.attachments) {
        try {
          const attachments = JSON.parse(application.attachments)
          fileList.value = attachments.map(name => ({ name }))
        } catch (e) {
          console.error('解析附件失败', e)
        }
      }
    } catch (error) {
      ElMessage.error(error?.message || '加载申请信息失败')
    } finally {
      loading.value = false
    }
  } else {
    isEdit.value = false
    // 创建模式：重置表单并填充用户信息
    resetForm()
    teamMembers.value = []
    fileList.value = []
  }
}

// 路由变化时重新加载（解决组件复用时 onMounted 不触发的问题）
watch(() => route.params.id, (newId) => {
  loadApplication()
  if (!newId && userStore.user) {
    formData.applicantName = userStore.user.realName || ''
    formData.applicantPhone = userStore.user.phone || ''
  }
}, { immediate: false })

onMounted(() => {
  loadApplication()
  // 创建模式：初始化时填充用户信息
  if (userStore.user && !route.params.id) {
    formData.applicantName = userStore.user.realName || ''
    formData.applicantPhone = userStore.user.phone || ''
  }
})
</script>

<style scoped>
.entry-application-form {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
