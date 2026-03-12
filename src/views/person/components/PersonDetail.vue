<template>
  <div class="person-detail">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      :disabled="mode === 'view'"
    >
      <!-- 基本信息 -->
      <el-divider content-position="left">基本信息</el-divider>
      
      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入姓名"
          maxlength="50"
        />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="formData.gender">
          <el-radio label="MALE">男</el-radio>
          <el-radio label="FEMALE">女</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="formData.phone"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="formData.email"
          placeholder="请输入邮箱"
          maxlength="100"
        />
      </el-form-item>

      <el-form-item label="身份证号" prop="idCard">
        <el-input
          v-model="formData.idCard"
          placeholder="请输入身份证号"
          maxlength="18"
        />
      </el-form-item>

      <!-- 职业信息 -->
      <el-divider content-position="left">职业信息</el-divider>

      <el-form-item label="人员类型" prop="personTypeId">
        <el-select
          v-model="formData.personTypeId"
          placeholder="请选择人员类型"
          style="width: 100%"
        >
          <el-option
            v-for="type in personTypes"
            :key="type.id"
            :label="type.typeName"
            :value="type.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="所属单位" prop="organization">
        <el-input
          v-model="formData.organization"
          placeholder="请输入所属单位/机构"
          maxlength="200"
        />
      </el-form-item>

      <el-form-item label="职位/职称" prop="position">
        <el-input
          v-model="formData.position"
          placeholder="请输入职位/职称"
          maxlength="100"
        />
      </el-form-item>

      <!-- 专业信息 -->
      <el-divider content-position="left">专业信息</el-divider>

      <el-form-item label="专业领域" prop="majorField">
        <el-input
          v-model="formData.majorField"
          placeholder="请输入专业领域"
          maxlength="200"
        />
      </el-form-item>

      <el-form-item label="研究方向" prop="researchDirection">
        <el-input
          v-model="formData.researchDirection"
          type="textarea"
          :rows="3"
          placeholder="请输入研究方向"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="主要成就" prop="achievements">
        <el-input
          v-model="formData.achievements"
          type="textarea"
          :rows="4"
          placeholder="请输入主要成就"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <!-- 其他信息 -->
      <el-divider content-position="left">其他信息</el-divider>

      <el-form-item label="个人简介" prop="introduction">
        <el-input
          v-model="formData.introduction"
          type="textarea"
          :rows="5"
          placeholder="请输入个人简介"
          maxlength="2000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="头像URL" prop="avatarUrl">
        <el-input
          v-model="formData.avatarUrl"
          placeholder="请输入头像URL"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status" v-if="mode !== 'create'">
        <el-radio-group v-model="formData.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 查看模式显示创建时间 -->
      <el-form-item v-if="mode === 'view'">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="创建时间" v-if="formData.createTime">
            {{ formatDateTime(formData.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" v-if="formData.updateTime">
            {{ formatDateTime(formData.updateTime) }}
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
  createPerson,
  updatePerson,
  getPersonTypes
} from '@/api/modules/person'
import { formatDate } from '@/utils/format'
import { rules as validateRules } from '@/utils/validate'

const props = defineProps({
  person: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'view' // view, create, edit
  }
})

const emit = defineEmits(['submit', 'close'])

// 人员类型列表
const personTypes = ref([])

// 表单数据
const formData = reactive({
  name: '',
  gender: 'MALE',
  phone: '',
  email: '',
  idCard: '',
  personTypeId: null,
  organization: '',
  position: '',
  majorField: '',
  researchDirection: '',
  achievements: '',
  introduction: '',
  avatarUrl: '',
  status: 1,
  createTime: null,
  updateTime: null
})

// 表单验证规则
const rules = {
  name: [
    validateRules.required('请输入姓名'),
    validateRules.length(1, 50)
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  phone: [
    validateRules.phone()
  ],
  email: [
    validateRules.email()
  ],
  personTypeId: [
    { required: true, message: '请选择人员类型', trigger: 'change' }
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
  return formatDate(datetime, 'YYYY-MM-DD HH:mm:ss')
}

// 监听人员变化
watch(
  () => props.person,
  (newVal) => {
    if (newVal) {
      Object.assign(formData, {
        name: newVal.name || '',
        gender: newVal.gender || 'MALE',
        phone: newVal.phone || '',
        email: newVal.email || '',
        idCard: newVal.idCard || '',
        personTypeId: newVal.personTypeId || null,
        organization: newVal.organization || '',
        position: newVal.position || '',
        majorField: newVal.majorField || '',
        researchDirection: newVal.researchDirection || '',
        achievements: newVal.achievements || '',
        introduction: newVal.introduction || '',
        avatarUrl: newVal.avatarUrl || '',
        status: newVal.status !== undefined ? newVal.status : 1,
        createTime: newVal.createTime || null,
        updateTime: newVal.updateTime || null
      })
    } else {
      // 重置表单
      Object.assign(formData, {
        name: '',
        gender: 'MALE',
        phone: '',
        email: '',
        idCard: '',
        personTypeId: null,
        organization: '',
        position: '',
        majorField: '',
        researchDirection: '',
        achievements: '',
        introduction: '',
        avatarUrl: '',
        status: 1,
        createTime: null,
        updateTime: null
      })
    }
    if (formRef.value) {
      formRef.value.clearValidate()
    }
  },
  { immediate: true }
)

// 获取人员类型
const fetchPersonTypes = async () => {
  try {
    personTypes.value = await getPersonTypes()
  } catch (error) {
    console.error('获取人员类型失败:', error)
  }
}

// 提交
const handleSubmit = async () => {
  const valid = await validateForm()
  if (!valid) return

  submitting.value = true
  try {
    if (props.mode === 'create') {
      await createPerson(formData)
      ElMessage.success('创建成功')
    } else {
      await updatePerson(props.person.id, formData)
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
  fetchPersonTypes()
})
</script>

<style scoped>
.person-detail {
  padding: 20px;
}

:deep(.el-divider__text) {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
</style>
