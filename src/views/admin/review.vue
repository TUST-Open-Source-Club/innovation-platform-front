<template>
  <div class="admin-review-center">
    <div class="page-header">
      <h2>审核中心</h2>
      <p class="subtitle">统一管理空间预约、入驻申请、新闻、项目、活动、基金申请等各类待审核申请</p>
    </div>

    <el-tabs v-model="activeTab" type="card" class="review-tabs">
      <el-tab-pane label="空间预约" name="space">
        <SpaceReservationReview v-if="activeTab === 'space'" />
      </el-tab-pane>
      <el-tab-pane label="入驻申请" name="entry">
        <EntryApplicationReview v-if="activeTab === 'entry'" />
      </el-tab-pane>
      <el-tab-pane v-if="isSchoolAdmin" label="新闻" name="news">
        <NewsReview v-if="activeTab === 'news'" />
      </el-tab-pane>
      <el-tab-pane label="项目" name="project">
        <ProjectReview v-if="activeTab === 'project'" />
      </el-tab-pane>
      <el-tab-pane label="活动" name="activity">
        <ActivityReview v-if="activeTab === 'activity'" />
      </el-tab-pane>
      <el-tab-pane label="基金申请" name="fund">
        <FundApplicationReview v-if="activeTab === 'fund'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SpaceReservationReview from '@/views/space/admin.vue'
import EntryApplicationReview from '@/views/entryApplication/review.vue'
import NewsReview from '@/views/news/review.vue'
import ProjectReview from '@/views/project/review.vue'
import ActivityReview from '@/views/activity/review.vue'
import FundApplicationReview from '@/views/informationLink/fundApplicationReviewList.vue'
import { usePermission } from '@/composables/usePermission'

const route = useRoute()
const activeTab = ref(route.query.tab || 'space')
const { isSchoolAdmin } = usePermission()

// 支持通过 URL 参数 ?tab=xxx 切换标签
watch(() => route.query.tab, (tab) => {
  const allowedTabs = isSchoolAdmin.value
    ? ['space', 'entry', 'news', 'project', 'activity', 'fund']
    : ['space', 'entry', 'project', 'activity', 'fund']
  if (tab && allowedTabs.includes(tab)) activeTab.value = tab
})

watch(isSchoolAdmin, (ok) => {
  if (!ok && activeTab.value === 'news') {
    activeTab.value = 'space'
  }
}, { immediate: true })
</script>

<style scoped>
.admin-review-center {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}

.page-header .subtitle {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.review-tabs :deep(.el-tabs__content) {
  padding: 0;
}

.review-tabs :deep(.el-tab-pane) {
  padding: 0;
}
</style>
