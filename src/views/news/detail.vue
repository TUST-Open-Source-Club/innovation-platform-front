<template>
  <div class="news-detail" v-loading="loading">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ news?.title }}</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <div class="news-content">
        <div class="news-meta">
          <el-tag :type="getStatusType(news?.status)">{{ getStatusText(news?.status) }}</el-tag>
          <span class="meta-item">作者：{{ news?.authorName }}</span>
          <span class="meta-item">分类：{{ news?.categoryName }}</span>
          <span class="meta-item">发布时间：{{ formatDateTime(news?.publishTime) }}</span>
          <span class="meta-item">浏览次数：{{ news?.viewCount || 0 }}</span>
        </div>

        <div v-if="news?.coverImage" class="cover-image">
          <el-image :src="news.coverImage" fit="cover" style="width: 100%; max-height: 400px" />
        </div>

        <div v-if="news?.summary" class="summary">
          <h3>摘要</h3>
          <p>{{ news.summary }}</p>
        </div>

        <div class="content">
          <div style="white-space: pre-wrap; line-height: 1.8;">{{ news?.content }}</div>
        </div>

        <div v-if="news?.relatedActivityTitle" class="related-activity">
          <el-link type="primary" @click="handleViewActivity(news.relatedActivityId)">
            关联活动：{{ news.relatedActivityTitle }}
          </el-link>
        </div>

        <div v-if="news?.attachments" class="attachments">
          <h4>附件</h4>
          <el-link
            v-for="(attachment, index) in getAttachments(news.attachments)"
            :key="index"
            type="primary"
            style="margin-right: 10px"
          >
            {{ attachment }}
          </el-link>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getNewsById } from '@/api/modules/news'
import { STATUS_TEXT, STATUS_TYPE } from '@/constants'
import { formatDateTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const news = ref(null)
const loading = ref(false)

const getStatusText = (status) => STATUS_TEXT[status] || status
const getStatusType = (status) => STATUS_TYPE[status] || ''

const getAttachments = (attachmentsStr) => {
  if (!attachmentsStr) return []
  try {
    return JSON.parse(attachmentsStr)
  } catch {
    return []
  }
}

const goBack = () => {
  router.back()
}

const handleViewActivity = (activityId) => {
  router.push(`/activities/${activityId}`)
}

const loadNews = async () => {
  loading.value = true
  try {
    news.value = await getNewsById(route.params.id)
  } catch (error) {
    ElMessage.error('加载新闻详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadNews()
})
</script>

<style scoped>
.news-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.news-content {
  padding: 20px 0;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.meta-item {
  color: #909399;
  font-size: 14px;
}

.cover-image {
  margin-bottom: 20px;
}

.summary {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.summary h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.content {
  margin-bottom: 20px;
  line-height: 1.8;
  font-size: 15px;
}

.related-activity {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f0f9ff;
  border-radius: 4px;
}

.attachments {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.attachments h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
}
</style>
