<template>
  <div class="entry-teams">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>已入驻团队</span>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="团队名称">
          <el-input
            v-model="searchForm.teamName"
            placeholder="搜索团队名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="团队类型">
          <el-select v-model="searchForm.teamType" placeholder="选择类型" clearable>
            <el-option label="创新团队" value="INNOVATION" />
            <el-option label="创业团队" value="STARTUP" />
            <el-option label="科研团队" value="RESEARCH" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 团队列表 -->
      <el-row :gutter="20">
        <el-col :span="6" v-for="team in teams" :key="team.id">
          <el-card class="team-card" shadow="hover" @click="handleViewDetail(team)">
            <div class="team-name">{{ team.teamName }}</div>
            <div class="team-type">
              <el-tag size="small">{{ getTeamTypeText(team.teamType) }}</el-tag>
            </div>
            <div class="team-info">
              <div>负责人：{{ team.leaderName }}</div>
              <div>团队规模：{{ team.teamSize }}人</div>
              <div>入驻时间：{{ formatDateTime(team.entryTime) }}</div>
            </div>
            <div class="team-description" v-if="team.teamDescription">
              {{ team.teamDescription.substring(0, 50) }}...
            </div>
          </el-card>
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" :title="currentTeam?.teamName || '团队详情'" width="700px">
      <el-descriptions :column="2" border v-if="currentTeam">
        <el-descriptions-item label="团队名称">{{ currentTeam.teamName }}</el-descriptions-item>
        <el-descriptions-item label="团队类型">
          <el-tag>{{ getTeamTypeText(currentTeam.teamType) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="负责人">{{ currentTeam.leaderName }}</el-descriptions-item>
        <el-descriptions-item label="负责人电话">{{ currentTeam.leaderPhone }}</el-descriptions-item>
        <el-descriptions-item label="负责人邮箱">{{ currentTeam.leaderEmail }}</el-descriptions-item>
        <el-descriptions-item label="团队规模">{{ currentTeam.teamSize }}人</el-descriptions-item>
        <el-descriptions-item label="项目名称">{{ currentTeam.projectName }}</el-descriptions-item>
        <el-descriptions-item label="预期入驻时长">{{ currentTeam.expectedDuration }}月</el-descriptions-item>
        <el-descriptions-item label="入驻时间">{{ formatDateTime(currentTeam.entryTime) }}</el-descriptions-item>
        <el-descriptions-item label="团队简介" :span="2">
          {{ currentTeam.teamDescription }}
        </el-descriptions-item>
        <el-descriptions-item label="项目描述" :span="2">
          {{ currentTeam.projectDescription }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { getEntryApplications } from '@/api/modules/entryApplication'
import { useTable } from '@/composables/useTable'
import { formatDateTime } from '@/utils/format'

const searchForm = reactive({
  teamName: '',
  teamType: ''
})

const detailDialogVisible = ref(false)
const currentTeam = ref(null)

const { tableData: teams, loading, page, size, total, loadData, handlePageChange, handleSizeChange } = useTable(
  async (params) => {
    const result = await getEntryApplications({
      ...params,
      ...searchForm,
      status: 'ENTERED' // 只查询已入驻的团队
    })
    return result
  },
  { immediate: true }
)

const getTeamTypeText = (type) => {
  const map = {
    'INNOVATION': '创新团队',
    'STARTUP': '创业团队',
    'RESEARCH': '科研团队'
  }
  return map[type] || type
}

const handleSearch = () => {
  page.value = 1
  loadData()
}

const handleReset = () => {
  searchForm.teamName = ''
  searchForm.teamType = ''
  handleSearch()
}

const handleViewDetail = (team) => {
  currentTeam.value = team
  detailDialogVisible.value = true
}
</script>

<style scoped>
.entry-teams {
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

.team-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.team-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.team-type {
  margin-bottom: 10px;
}

.team-info {
  color: #606266;
  font-size: 14px;
  margin-bottom: 10px;
}

.team-info div {
  margin-bottom: 5px;
}

.team-description {
  color: #909399;
  font-size: 13px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}
</style>
