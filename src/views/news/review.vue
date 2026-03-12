<template>
  <div class="news-review">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>新闻审核</span>
        </div>
      </template>

      <!-- 筛选条件 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.title"
            placeholder="搜索新闻标题"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 新闻列表 -->
      <el-table :data="newsList" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column prop="authorName" label="作者" width="120" />
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approvalStatus" label="审批状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.approvalStatus)">{{ getStatusText(row.approvalStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">查看详情</el-button>
            <el-button
              v-if="row.approvalStatus === 'PENDING'"
              link
              type="success"
              @click="handleReview(row, 'APPROVED')"
            >
              通过
            </el-button>
            <el-button
              v-if="row.approvalStatus === 'PENDING'"
              link
              type="danger"
              @click="handleReview(row, 'REJECTED')"
            >
              驳回
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

    <!-- 审核对话框 -->
    <el-dialog v-model="reviewDialogVisible" :title="reviewTitle" width="600px">
      <el-form :model="reviewForm" label-width="120px">
        <el-form-item label="新闻标题">
          <span>{{ currentNews?.title }}</span>
        </el-form-item>
        <el-form-item label="作者">
          <span>{{ currentNews?.authorName }}</span>
        </el-form-item>
        <el-form-item label="摘要">
          <span>{{ currentNews?.summary }}</span>
        </el-form-item>
        <el-form-item label="审批意见" prop="reviewComment">
          <el-input
            v-model="reviewForm.reviewComment"
            type="textarea"
            :rows="4"
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="reviewing" @click="handleSubmitReview">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getNews, reviewNews } from '@/api/modules/news'
import { useTable } from '@/composables/useTable'
import { STATUS_TEXT, STATUS_TYPE } from '@/constants'
import { formatDateTime } from '@/utils/format'

const router = useRouter()

const searchForm = reactive({
  title: '',
  approvalStatus: 'PENDING' // 默认显示待审核
})

const { tableData: newsList, loading, page, size, total, loadData, handlePageChange, handleSizeChange } = useTable(
  async (params) => {
    const result = await getNews({
      ...params,
      title: searchForm.title,
      approvalStatus: searchForm.approvalStatus || 'PENDING'
    })
    return result
  },
  { immediate: true }
)

const reviewDialogVisible = ref(false)
const reviewing = ref(false)
const currentNews = ref(null)
const reviewAction = ref('')

const reviewForm = reactive({
  reviewComment: ''
})

const reviewTitle = computed(() => {
  return reviewAction.value === 'APPROVED' ? '审核通过' : '审核驳回'
})

const getStatusText = (status) => STATUS_TEXT[status] || status
const getStatusType = (status) => STATUS_TYPE[status] || ''

const handleSearch = () => {
  page.value = 1
  loadData()
}

const handleReset = () => {
  searchForm.title = ''
  searchForm.approvalStatus = 'PENDING'
  handleSearch()
}

const handleViewDetail = (news) => {
  router.push(`/news/${news.id}`)
}

const handleReview = (news, action) => {
  currentNews.value = news
  reviewAction.value = action
  reviewForm.reviewComment = ''
  reviewDialogVisible.value = true
}

const handleSubmitReview = async () => {
  reviewing.value = true
  try {
    await reviewNews(currentNews.value.id, {
      approvalStatus: reviewAction.value,
      reviewComment: reviewForm.reviewComment
    })
    ElMessage.success('审核完成')
    reviewDialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error(error.message || '审核失败')
  } finally {
    reviewing.value = false
  }
}
</script>

<style scoped>
.news-review {
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
