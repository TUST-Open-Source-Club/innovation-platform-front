<template>
  <div class="organization-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>组织管理</span>
          <el-button type="primary" @click="handleCreate">创建组织</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="组织名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索组织名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="组织类型">
          <el-select v-model="searchForm.organizationTypeId" placeholder="选择类型" clearable>
            <el-option
              v-for="type in organizationTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
            <el-option label="活跃" value="ACTIVE" />
            <el-option label="非活跃" value="INACTIVE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 组织列表 -->
      <el-table :data="organizations" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="组织名称" />
        <el-table-column prop="leaderName" label="负责人" />
        <el-table-column prop="memberCount" label="成员数量" />
        <el-table-column prop="collegeName" label="所属学院" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">查看详情</el-button>
            <el-button
              v-if="isMyOrganization(row)"
              link
              type="primary"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="isMyOrganization(row)"
              link
              type="success"
              @click="handleManageMembers(row)"
            >
              成员管理
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- ====================== -->
      <!-- 我帮你加的分页在这里 ↓↓↓ -->
      <!-- ====================== -->
      <div style="margin-top:20px; text-align:right;">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10,20,50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 组织详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      :title="currentOrganization?.name || '组织详情'"
      size="600px"
    >
      <div v-if="currentOrganization" class="organization-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="组织名称">{{ currentOrganization.name }}</el-descriptions-item>
          <el-descriptions-item label="组织类型">{{ currentOrganization.organizationTypeName }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ currentOrganization.leaderName }}</el-descriptions-item>
          <el-descriptions-item label="成员数量">{{ currentOrganization.memberCount }}人</el-descriptions-item>
          <el-descriptions-item label="所属学院">{{ currentOrganization.collegeName }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrganization.status)">
              {{ getStatusText(currentOrganization.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="组织描述">
            {{ currentOrganization.description || '暂无描述' }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider>成员列表</el-divider>
        <el-table :data="members" style="width: 100%">
          <el-table-column prop="userName" label="姓名" />
          <el-table-column prop="role" label="角色">
            <template #default="{ row }">
              <el-tag>{{ row.role === 'LEADER' ? '负责人' : '成员' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="joinTime" label="加入时间">
            <template #default="{ row }">
              {{ formatDateTime(row.joinTime) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>

    <!-- 成员管理抽屉 -->
    <el-drawer
      v-model="memberDrawerVisible"
      title="成员管理"
      size="500px"
    >
      <div v-if="currentOrganization">
        <el-form :inline="true" class="member-search">
          <el-form-item>
            <el-input
              v-model="memberSearchKeyword"
              placeholder="搜索成员姓名"
              clearable
              @keyup.enter="handleSearchMember"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleAddMember">添加成员</el-button>
          </el-form-item>
        </el-form>

        <el-table :data="filteredMembers" style="width: 100%">
          <el-table-column prop="userName" label="姓名" />
          <el-table-column prop="role" label="角色">
            <template #default="{ row }">
              <el-tag>{{ row.role === 'LEADER' ? '负责人' : '成员' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button
                v-if="row.role !== 'LEADER'"
                link
                type="danger"
                @click="handleRemoveMember(row)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  getOrganizations,
  getOrganizationById,
  getOrganizationMembers,
  getOrganizationTypes,
  removeOrganizationMember
} from '@/api/modules/organization'
import { STATUS_TEXT, STATUS_TYPE } from '@/constants'
import { formatDateTime } from '@/utils/format'

const userStore = useUserStore()

const organizations = ref([])
const organizationTypes = ref([])
const loading = ref(false)
const detailDrawerVisible = ref(false)
const memberDrawerVisible = ref(false)
const currentOrganization = ref(null)
const members = ref([])
const memberSearchKeyword = ref('')

// ======================
// 分页变量（我加的）
// ======================
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  keyword: '',
  organizationTypeId: null,
  status: ''
})

const filteredMembers = computed(() => {
  if (!memberSearchKeyword.value) {
    return members.value
  }
  return members.value.filter(m => 
    m.userName.includes(memberSearchKeyword.value)
  )
})

const getStatusText = (status) => STATUS_TEXT[status] || status
const getStatusType = (status) => STATUS_TYPE[status] || ''

const isMyOrganization = (org) => {
  return org.leaderId === userStore.user?.id
}

const loadOrganizations = async () => {
  loading.value = true
  try {
    // 把分页参数带给后端
    const params = {
      ...searchForm,
      page: currentPage.value,
      pageSize: pageSize.value
    }
    const result = await getOrganizations(params)
    
    if (result && result.data) {
      // 兼容两种后端返回格式
      organizations.value = result.data.records || result.data.list || result.data
      total.value = result.data.total || result.data.count || organizations.value.length
    } else {
      organizations.value = []
      total.value = 0
    }
  } catch (error) {
    ElMessage.error('加载组织列表失败')
  } finally {
    loading.value = false
  }
}

const loadOrganizationTypes = async () => {
  try {
    const result = await getOrganizationTypes()
    if (result && result.data) {
      organizationTypes.value = result.data
    }
  } catch (error) {
    console.error('加载组织类型失败', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1 // 搜索回到第一页
  loadOrganizations()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.organizationTypeId = null
  searchForm.status = ''
  currentPage.value = 1
  loadOrganizations()
}

// ======================
// 分页切换（我加的）
// ======================
const handleSizeChange = (val) => {
  pageSize.value = val
  loadOrganizations()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadOrganizations()
}

const handleCreate = () => {
  ElMessage.info('创建组织功能待实现')
}

const handleViewDetail = async (org) => {
  currentOrganization.value = org
  try {
    const result = await getOrganizationMembers(org.id)
    if (result && result.data) {
      members.value = result.data
    } else {
      members.value = []
    }
  } catch (error) {
    ElMessage.error('加载成员列表失败')
  }
  detailDrawerVisible.value = true
}

const handleEdit = (org) => {
  ElMessage.info('编辑组织功能待实现')
}

const handleManageMembers = async (org) => {
  currentOrganization.value = org
  try {
    const result = await getOrganizationMembers(org.id)
    if (result && result.data) {
      members.value = result.data
    } else {
      members.value = []
    }
  } catch (error) {
    ElMessage.error('加载成员列表失败')
  }
  memberDrawerVisible.value = true
}

const handleAddMember = () => {
  ElMessage.info('添加成员功能待实现')
}

const handleRemoveMember = async (member) => {
  try {
    await ElMessageBox.confirm('确定要移除该成员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await removeOrganizationMember(currentOrganization.value.id, member.id)
    ElMessage.success('成员已移除')
    handleManageMembers(currentOrganization.value)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '移除失败')
    }
  }
}

const handleSearchMember = () => {}

onMounted(() => {
  loadOrganizationTypes()
  loadOrganizations()
})
</script>

<style scoped>
.organization-management {
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

.organization-detail {
  padding: 20px;
}

.member-search {
  margin-bottom: 20px;
}
</style>