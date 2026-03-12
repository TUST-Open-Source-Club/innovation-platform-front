<template>
  <div class="organization-members">
    <div class="members-header">
      <h3>{{ organizationName }} - 成员管理</h3>
      <el-button type="primary" @click="handleAddMember">
        <el-icon><Plus /></el-icon>
        添加成员
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="members"
      stripe
      border
      style="width: 100%"
    >
      <el-table-column prop="userName" label="姓名" width="120" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="getRoleTagType(row.role)" size="small">
            {{ getRoleText(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="position" label="职位" width="150" />
      <el-table-column prop="joinDate" label="加入日期" width="120">
        <template #default="{ row }">
          {{ formatDate(row.joinDate) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '正常' : '已退出' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleRemove(row.id)"
            :disabled="row.status === 0"
          >
            <el-icon><Delete /></el-icon>
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑成员对话框 -->
    <el-dialog
      v-model="memberDialogVisible"
      :title="memberDialogMode === 'create' ? '添加成员' : '编辑成员'"
      width="500px"
    >
      <el-form
        ref="memberFormRef"
        :model="memberForm"
        :rules="memberRules"
        label-width="100px"
      >
        <el-form-item label="用户" prop="userId">
          <el-select
            v-model="memberForm.userId"
            placeholder="请选择用户"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.name || user.username"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="memberForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="负责人" value="LEADER" />
            <el-option label="副负责人" value="DEPUTY" />
            <el-option label="成员" value="MEMBER" />
          </el-select>
        </el-form-item>

        <el-form-item label="职位" prop="position">
          <el-input v-model="memberForm.position" placeholder="请输入职位" />
        </el-form-item>

        <el-form-item label="加入日期" prop="joinDate">
          <el-date-picker
            v-model="memberForm.joinDate"
            type="date"
            placeholder="选择加入日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="memberDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleMemberSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'
import {
  getOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMember,
  removeOrganizationMember
} from '@/api/modules/organization'
import { rules as validateRules } from '@/utils/validate'

const props = defineProps({
  organizationId: {
    type: [Number, String],
    required: true
  },
  organizationName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const members = ref([])

// 成员对话框
const memberDialogVisible = ref(false)
const memberDialogMode = ref('create')
const memberFormRef = ref(null)
const submitting = ref(false)
const memberForm = reactive({
  userId: null,
  role: 'MEMBER',
  position: '',
  joinDate: ''
})

// 用户列表（这里应该从后端获取，暂时写死）
const users = ref([])

// 成员表单验证规则
const memberRules = {
  userId: [
    { required: true, message: '请选择用户', trigger: 'change' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  joinDate: [
    { required: true, message: '请选择加入日期', trigger: 'change' }
  ]
}

// 获取成员列表
const fetchMembers = async () => {
  loading.value = true
  try {
    members.value = await getOrganizationMembers(props.organizationId)
  } catch (error) {
    console.error('获取成员列表失败:', error)
    members.value = []
  } finally {
    loading.value = false
  }
}

// 添加成员
const handleAddMember = () => {
  memberDialogMode.value = 'create'
  memberForm.userId = null
  memberForm.role = 'MEMBER'
  memberForm.position = ''
  memberForm.joinDate = ''
  if (memberFormRef.value) {
    memberFormRef.value.clearValidate()
  }
  memberDialogVisible.value = true
}

// 编辑成员
const handleEdit = (row) => {
  memberDialogMode.value = 'edit'
  memberForm.userId = row.userId
  memberForm.role = row.role
  memberForm.position = row.position || ''
  memberForm.joinDate = row.joinDate || ''
  memberForm.id = row.id
  memberDialogVisible.value = true
}

// 移除成员
const handleRemove = async (memberId) => {
  try {
    await ElMessageBox.confirm('确定要移除该成员吗？', '提示', {
      type: 'warning'
    })
    await removeOrganizationMember(props.organizationId, memberId)
    ElMessage.success('移除成功')
    fetchMembers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除失败:', error)
    }
  }
}

// 提交成员表单
const handleMemberSubmit = async () => {
  if (!memberFormRef.value) return

  await memberFormRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (memberDialogMode.value === 'create') {
        await addOrganizationMember(props.organizationId, memberForm)
        ElMessage.success('添加成功')
      } else {
        await updateOrganizationMember(props.organizationId, memberForm.id, memberForm)
        ElMessage.success('更新成功')
      }
      memberDialogVisible.value = false
      fetchMembers()
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      submitting.value = false
    }
  })
}

// 角色标签类型
const getRoleTagType = (role) => {
  const types = {
    LEADER: 'danger',
    DEPUTY: 'warning',
    MEMBER: 'info'
  }
  return types[role] || 'info'
}

const getRoleText = (role) => {
  const texts = {
    LEADER: '负责人',
    DEPUTY: '副负责人',
    MEMBER: '成员'
  }
  return texts[role] || role
}

// 监听组织ID变化
watch(
  () => props.organizationId,
  () => {
    if (props.organizationId) {
      fetchMembers()
    }
  },
  { immediate: true }
)

onMounted(() => {
  fetchMembers()
  // TODO: 获取用户列表
})
</script>

<style scoped>
.organization-members {
  padding: 20px;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.members-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
</style>
