<template>
  <div class="person-library">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>人员库</span>
          <el-button v-if="canManagePerson" type="primary" @click="handleAdd">添加人员</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="人员类型">
          <el-select
            v-model="searchForm.personTypeId"
            placeholder="选择类型"
            clearable
            filterable
          >
            <el-option
              v-for="type in personTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索姓名、单位、专业领域"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 人员列表 -->
      <el-row :gutter="20" v-loading="loading">
        <el-col :span="6" v-for="person in persons" :key="person.id">
          <el-card class="person-card" shadow="hover" @click="handleViewDetail(person)">
            <div class="person-avatar">
              <el-avatar :size="60" :src="person.avatar">
                {{ person.name?.charAt(0) }}
              </el-avatar>
            </div>
            <div class="person-name">{{ person.name }}</div>
            <div class="person-title">{{ person.title }}</div>
            <div class="person-organization">{{ person.organization }}</div>
            <div class="person-tags">
              <el-tag size="small" v-for="area in getExpertiseAreas(person.expertiseAreas)" :key="area">
                {{ area }}
              </el-tag>
            </div>
            <div v-if="canManagePerson" class="person-actions" @click.stop>
              <el-button link type="primary" size="small" @click="handleEdit(person)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleRemove(person)">移除</el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :span="24" v-if="!loading && persons.length === 0">
          <el-empty description="暂无人员数据" />
        </el-col>
      </el-row>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        :page-sizes="[12, 24, 48]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 人员详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      :title="currentPerson?.name || '人员详情'"
      size="600px"
    >
      <div v-if="currentPerson" class="person-detail">
        <div class="person-header">
          <el-avatar :size="80" :src="currentPerson.avatar">
            {{ currentPerson.name?.charAt(0) }}
          </el-avatar>
          <div class="person-info">
            <h3>{{ currentPerson.name }}</h3>
            <p>{{ currentPerson.title }}</p>
            <p>{{ currentPerson.organization }}</p>
          </div>
        </div>

        <el-divider />

        <el-descriptions :column="1" border>
          <el-descriptions-item label="人员类型">
            {{ currentPerson.personTypeName }}
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ currentPerson.gender === 'MALE' ? '男' : currentPerson.gender === 'FEMALE' ? '女' : '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ currentPerson.phone || '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ currentPerson.email || '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="职位">
            {{ currentPerson.position || '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="研究方向">
            {{ currentPerson.researchDirection || '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="专业领域">
            <el-tag
              v-for="area in getExpertiseAreas(currentPerson.expertiseAreas)"
              :key="area"
              style="margin-right: 5px"
            >
              {{ area }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="主要成就">
            <div style="white-space: pre-wrap">{{ currentPerson.achievements || '暂无' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="个人简介">
            <div style="white-space: pre-wrap">{{ currentPerson.introduction || '暂无' }}</div>
          </el-descriptions-item>
        </el-descriptions>
        <div v-if="canManagePerson" class="drawer-footer">
          <el-button type="primary" @click="handleEdit(currentPerson)">编辑</el-button>
          <el-button type="danger" @click="handleRemove(currentPerson)">移除</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 添加/编辑人员弹窗 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="formMode === 'add' ? '添加人员' : '编辑人员'"
      width="560px"
      destroy-on-close
      @close="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio label="MALE">男</el-radio>
            <el-radio label="FEMALE">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="人员类型" prop="personTypeId">
          <el-select v-model="formData.personTypeId" placeholder="请选择" style="width: 100%">
            <el-option v-for="t in personTypes" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" maxlength="20" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="100" />
        </el-form-item>
        <el-form-item label="职称/头衔" prop="title">
          <el-input v-model="formData.title" placeholder="请输入职称或头衔" maxlength="100" />
        </el-form-item>
        <el-form-item label="所属单位" prop="organization">
          <el-input v-model="formData.organization" placeholder="请输入所属单位" maxlength="200" />
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="formData.position" placeholder="请输入职位" maxlength="100" />
        </el-form-item>
        <el-form-item label="研究方向" prop="researchDirection">
          <el-input v-model="formData.researchDirection" type="textarea" :rows="2" placeholder="研究方向" maxlength="500" />
        </el-form-item>
        <el-form-item label="专业领域" prop="expertiseAreas">
          <el-input v-model="formData.expertiseAreas" placeholder="多个领域用英文逗号分隔，如：人工智能,大数据" />
        </el-form-item>
        <el-form-item label="主要成就" prop="achievements">
          <el-input v-model="formData.achievements" type="textarea" :rows="3" placeholder="主要成就" maxlength="1000" show-word-limit />
        </el-form-item>
        <el-form-item label="个人简介" prop="introduction">
          <el-input v-model="formData.introduction" type="textarea" :rows="3" placeholder="个人简介" maxlength="2000" show-word-limit />
        </el-form-item>
        <el-form-item label="头像URL" prop="avatar">
          <el-input v-model="formData.avatar" placeholder="选填" />
        </el-form-item>
        <el-form-item v-if="formMode === 'edit'" label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="ACTIVE">活跃</el-radio>
            <el-radio label="INACTIVE">非活跃</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="formSubmitting" @click="handleFormSubmit">
          {{ formMode === 'add' ? '添加' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePagination } from '@/composables/usePagination'
import { usePermission } from '@/composables/usePermission'
import { getPersons, getPersonById, getPersonTypes, createPerson, updatePerson, deletePerson } from '@/api/modules/person'

const { isAdmin } = usePermission()
const canManagePerson = isAdmin

const personTypes = ref([])
const persons = ref([])
const loading = ref(false)
const detailDrawerVisible = ref(false)
const currentPerson = ref(null)
const formDialogVisible = ref(false)
const formMode = ref('add') // add | edit
const editingId = ref(null)
const formSubmitting = ref(false)
const formRef = ref(null)

const searchForm = reactive({
  personTypeId: null,
  keyword: ''
})

const formData = reactive({
  name: '',
  gender: 'MALE',
  personTypeId: null,
  phone: '',
  email: '',
  title: '',
  organization: '',
  position: '',
  researchDirection: '',
  expertiseAreas: '',
  achievements: '',
  introduction: '',
  avatar: '',
  status: 'ACTIVE'
})

const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  personTypeId: [{ required: true, message: '请选择人员类型', trigger: 'change' }]
}

const { page, size, total, changePage, changeSize } = usePagination(1, 12)

const handlePageChange = (p) => {
  changePage(p)
  loadPersons()
}
const handleSizeChange = (s) => {
  changeSize(s)
  loadPersons()
}

const getExpertiseAreas = (areas) => {
  if (!areas) return []
  try {
    const arr = typeof areas === 'string' ? JSON.parse(areas) : areas
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

const loadPersons = async () => {
  loading.value = true
  try {
    const result = await getPersons({
      pageNum: page.value,
      pageSize: size.value,
      personTypeId: searchForm.personTypeId,
      keyword: searchForm.keyword
    })
    persons.value = result?.list || []
    total.value = result?.total || 0
  } catch (error) {
    ElMessage.error(error?.message || '加载人员列表失败')
    persons.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const loadPersonTypes = async () => {
  try {
    personTypes.value = await getPersonTypes() || []
  } catch (error) {
    console.error('加载人员类型失败', error)
  }
}

const handleSearch = () => {
  page.value = 1
  loadPersons()
}

const handleReset = () => {
  searchForm.personTypeId = null
  searchForm.keyword = ''
  handleSearch()
}

const handleViewDetail = async (person) => {
  try {
    const detail = await getPersonById(person.id)
    currentPerson.value = detail
    detailDrawerVisible.value = true
  } catch (error) {
    ElMessage.error('加载人员详情失败')
  }
}

function resetForm() {
  editingId.value = null
  Object.assign(formData, {
    name: '',
    gender: 'MALE',
    personTypeId: null,
    phone: '',
    email: '',
    title: '',
    organization: '',
    position: '',
    researchDirection: '',
    expertiseAreas: '',
    achievements: '',
    introduction: '',
    avatar: '',
    status: 'ACTIVE'
  })
  formRef.value?.clearValidate()
}

const handleAdd = () => {
  formMode.value = 'add'
  resetForm()
  formDialogVisible.value = true
}

const handleEdit = (person) => {
  formMode.value = 'edit'
  editingId.value = person.id
  const areas = getExpertiseAreas(person.expertiseAreas)
  Object.assign(formData, {
    name: person.name || '',
    gender: person.gender || 'MALE',
    personTypeId: person.personTypeId || null,
    phone: person.phone || '',
    email: person.email || '',
    title: person.title || '',
    organization: person.organization || '',
    position: person.position || '',
    researchDirection: person.researchDirection || '',
    expertiseAreas: Array.isArray(areas) ? areas.join(',') : '',
    achievements: person.achievements || '',
    introduction: person.introduction || '',
    avatar: person.avatar || '',
    status: person.status || 'ACTIVE'
  })
  detailDrawerVisible.value = false
  formDialogVisible.value = true
}

const handleFormSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    formSubmitting.value = true
    try {
      const expertiseAreasStr = formData.expertiseAreas
        ? JSON.stringify(formData.expertiseAreas.split(/[,，]/).map(s => s.trim()).filter(Boolean))
        : null
      const payload = {
        name: formData.name,
        gender: formData.gender,
        personTypeId: formData.personTypeId,
        phone: formData.phone || null,
        email: formData.email || null,
        title: formData.title || null,
        organization: formData.organization || null,
        position: formData.position || null,
        researchDirection: formData.researchDirection || null,
        expertiseAreas: expertiseAreasStr,
        achievements: formData.achievements || null,
        introduction: formData.introduction || null,
        avatar: formData.avatar || null,
        status: formData.status
      }
      if (formMode.value === 'add') {
        await createPerson(payload)
        ElMessage.success('添加成功')
      } else {
        await updatePerson(editingId.value, payload)
        ElMessage.success('更新成功')
      }
      formDialogVisible.value = false
      loadPersons()
    } catch (e) {
      ElMessage.error(e?.message || '操作失败')
    } finally {
      formSubmitting.value = false
    }
  })
}

const handleRemove = async (person) => {
  try {
    await ElMessageBox.confirm(`确定要移除人员「${person.name}」吗？`, '确认移除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deletePerson(person.id)
    ElMessage.success('已移除')
    detailDrawerVisible.value = false
    currentPerson.value = null
    loadPersons()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e?.message || '移除失败')
  }
}

onMounted(() => {
  loadPersonTypes()
  loadPersons()
})
</script>

<style scoped>
.person-library {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.person-card {
  margin-bottom: 20px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;
}

.person-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.person-avatar {
  margin-bottom: 10px;
}

.person-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.person-title {
  color: #909399;
  font-size: 14px;
  margin-bottom: 5px;
}

.person-organization {
  color: #606266;
  font-size: 13px;
  margin-bottom: 10px;
}

.person-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
}

.person-actions {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.drawer-footer {
  display: flex;
  gap: 12px;
}

.person-detail {
  padding: 20px;
}

.person-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.person-info h3 {
  margin: 0 0 10px 0;
}

.person-info p {
  margin: 5px 0;
  color: #909399;
}
</style>
