<template>
  <div class="organization-drawer">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      :disabled="mode === 'view'"
    >
      <el-form-item label="组织编号" prop="orgCode">
        <el-input
          v-model="formData.orgCode"
          placeholder="请输入组织编号"
          :disabled="mode === 'edit'"
        />
      </el-form-item>

      <el-form-item label="组织名称" prop="orgName">
        <el-input
          v-model="formData.orgName"
          placeholder="请输入组织名称"
          maxlength="200"
        />
      </el-form-item>

      <el-form-item label="组织类型" prop="organizationTypeId">
        <el-select
          v-model="formData.organizationTypeId"
          placeholder="请选择组织类型"
          style="width: 100%"
        >
          <el-option
            v-for="type in organizationTypes"
            :key="type.id"
            :label="type.typeName"
            :value="type.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="负责人" prop="leaderName">
        <el-input
          v-model="formData.leaderName"
          placeholder="请输入负责人姓名"
        />
      </el-form-item>

      <el-form-item label="成立日期" prop="establishmentDate">
        <el-date-picker
          v-model="formData.establishmentDate"
          type="date"
          placeholder="选择成立日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="组织描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入组织描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="Logo URL" prop="logoUrl">
        <el-input
          v-model="formData.logoUrl"
          placeholder="请输入Logo URL"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status" v-if="mode !== 'create'">
        <el-radio-group v-model="formData.status">
          <el-radio :label="1">正常</el-radio>
          <el-radio :label="2">暂停</el-radio>
          <el-radio :label="0">已解散</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="mode === 'view'">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="审批状态">
            <el-tag :type="getApprovalStatusTagType(formData.approvalStatus)" size="small">
              {{ getApprovalStatusText(formData.approvalStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审批人" v-if="formData.approverId">
            {{ formData.approverName }}
          </el-descriptions-item>
          <el-descriptions-item label="审批时间" v-if="formData.approvalTime">
            {{ formatDateTime(formData.approvalTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="审批意见" v-if="formData.approvalComment">
            {{ formData.approvalComment }}
          </el-descriptions-item>
        </el-descriptions>
      </el-form-item>

      <el-form-item v-if="mode !== 'view'">
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ mode === 'create' ? '创建' : '保存' }}
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useForm } from '@/composables/useForm'
import {
  createOrganization,
  updateOrganization,
  getOrganizationTypes
} from '@/api/modules/organization'
import { formatDate } from '@/utils/format'
import { rules as validateRules } from '@/utils/validate'

const props = defineProps({
  organization: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'view' // view, create, edit
  }
})

const emit = defineEmits(['submit', 'close'])

// 组织类型列表
const organizationTypes = ref([])

// 表单数据
const formData = reactive({
  orgCode: '',
  orgName: '',
  organizationTypeId: null,
  leaderName: '',
  establishmentDate: '',
  description: '',
  logoUrl: '',
  status: 1,
  approvalStatus: 'PENDING',
  approverId: null,
  approverName: '',
  approvalTime: null,
  approvalComment: ''
})

// 表单验证规则
const rules = {
  orgCode: [
    validateRules.required('请输入组织编号')
  ],
  orgName: [
    validateRules.required('请输入组织名称'),
    validateRules.length(1, 200)
  ],
  organizationTypeId: [
    { required: true, message: '请选择组织类型', trigger: 'change' }
  ],
  leaderName: [
    validateRules.required('请输入负责人姓名')
  ],
  establishmentDate: [
    { required: true, message: '请选择成立日期', trigger: 'change' }
  ]
}

const {
  formRef,
  loading: submitting,
  validateForm
} = useForm(formData)

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return '-'
  return formatDate(datetime, 'YYYY-MM-DD HH:mm')
}

// 状态标签类型
const getApprovalStatusTagType = (status) => {
  const types = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger'
  }
  return types[status] || 'info'
}

const getApprovalStatusText = (status) => {
  const texts = {
    PENDING: '待审批',
    APPROVED: '已通过',
    REJECTED: '已拒绝'
  }
  return texts[status] || status
}

// 监听组织变化
watch(
  () => props.organization,
  (newVal) => {
    if (newVal) {
      Object.assign(formData, {
        orgCode: newVal.orgCode || '',
        orgName: newVal.orgName || '',
        organizationTypeId: newVal.organizationTypeId || null,
        leaderName: newVal.leaderName || '',
        establishmentDate: newVal.establishmentDate || '',
        description: newVal.description || '',
        logoUrl: newVal.logoUrl || '',
        status: newVal.status !== undefined ? newVal.status : 1,
        approvalStatus: newVal.approvalStatus || 'PENDING',
        approverId: newVal.approverId || null,
        approverName: newVal.approverName || '',
        approvalTime: newVal.approvalTime || null,
        approvalComment: newVal.approvalComment || ''
      })
    } else {
      // 重置表单
      Object.assign(formData, {
        orgCode: '',
        orgName: '',
        organizationTypeId: null,
        leaderName: '',
        establishmentDate: '',
        description: '',
        logoUrl: '',
        status: 1,
        approvalStatus: 'PENDING',
        approverId: null,
        approverName: '',
        approvalTime: null,
        approvalComment: ''
      })
    }
    if (formRef.value) {
      formRef.value.clearValidate()
    }
  },
  { immediate: true }
)

// 获取组织类型
const fetchOrganizationTypes = async () => {
  try {
    organizationTypes.value = await getOrganizationTypes()
  } catch (error) {
    console.error('获取组织类型失败:', error)
  }
}

// 提交
const handleSubmit = async () => {
  const valid = await validateForm()
  if (!valid) return

  submitting.value = true
  try {
    if (props.mode === 'create') {
      await createOrganization(formData)
      ElMessage.success('创建成功')
    } else {
      await updateOrganization(props.organization.id, formData)
      ElMessage.success('更新成功')
    }
    emit('submit')
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    submitting.value = false
  }
}

// 取消
const handleCancel = () => {
  emit('close')
}

onMounted(() => {
  fetchOrganizationTypes()
})
</script>

<style scoped>
.organization-drawer {
  padding: 20px;
}
</style>
