<template>
  <div class="news-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>新闻中心</span>
          <div>
            <el-button v-if="isSchoolAdmin" @click="goToReview">新闻审核</el-button>
            <el-button v-if="isCollegeAdmin || isSchoolAdmin" type="primary" @click="handleCreate">发布新闻</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.title"
            placeholder="搜索新闻标题"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <!-- 状态筛选仅学校/学院管理员可见 -->
        <el-form-item v-if="isSchoolAdmin || isCollegeAdmin" label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="选择状态"
            clearable
            filterable
          >
            <el-option label="全部" value="" />
            <el-option label="已发布" value="PUBLISHED" />
            <el-option label="草稿" value="DRAFT" />
            <el-option label="待审核" value="PENDING" />
            <el-option label="已驳回" value="REJECTED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 新闻列表 -->
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column prop="authorName" label="作者" width="120" />
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="viewCount" label="浏览次数" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.publishTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row.id)">查看</el-button>
            <el-button
              v-if="(isCollegeAdmin || isSchoolAdmin) && isMyNews(row) && row.status === 'DRAFT'"
              link
              type="primary"
              @click="handleEdit(row.id)"
            >
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getNews } from '@/api/modules/news'
import { useTable } from '@/composables/useTable'
import { usePermission } from '@/composables/usePermission'
import { useUserStore } from '@/stores/user'
import { STATUS_TEXT, STATUS_TYPE } from '@/constants'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const userStore = useUserStore()
const { isSchoolAdmin, isCollegeAdmin } = usePermission()

const searchForm = reactive({
  title: '',
  status: 'PUBLISHED' // 默认显示已发布的新闻，空表示全部
})

const { tableData, loading, page, size, total, loadData, handlePageChange, handleSizeChange } = useTable(
  async (params) => {
    const queryParams = { ...params, title: searchForm.title }
    if (searchForm.status) queryParams.status = searchForm.status
    const result = await getNews(queryParams)
    return result
  },
  { immediate: true }
)

const getStatusText = (status) => STATUS_TEXT[status] || status
const getStatusType = (status) => STATUS_TYPE[status] || ''

const isMyNews = (news) => {
  return news.authorId === userStore.user?.id
}

const handleCreate = () => {
  router.push('/news/create')
}

const goToReview = () => {
  router.push('/news/review')
}

const handleView = (id) => {
  router.push(`/news/${id}`)
}

const handleEdit = (id) => {
  router.push(`/news/${id}/edit`)
}

const handleSearch = () => {
  page.value = 1
  loadData()
}

const handleReset = () => {
  searchForm.title = ''
  searchForm.status = ''
  handleSearch()
}
</script>

<style scoped>
.news-list {
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
</style>
