<template>
  <div class="activity-summary-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>活动总结</span>
          <el-button type="primary" size="small" :loading="loading" @click="loadData">刷新</el-button>
        </div>
      </template>
      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="activityTitle" label="活动标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="actualParticipants" label="实际参与人数" width="120" align="center">
          <template #default="{ row }">
            {{ row.actualParticipants != null ? row.actualParticipants : '—' }}
          </template>
        </el-table-column>
        <el-table-column prop="summaryContent" label="活动总结" min-width="180" show-overflow-tooltip />
        <el-table-column prop="achievements" label="活动成果" min-width="160" show-overflow-tooltip />
        <el-table-column label="照片/附件" width="100" align="center">
          <template #default="{ row }">
            <span>{{ hasPhotosOrAttachments(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="approvalStatus" label="审批状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getApprovalType(row.approvalStatus)" size="small">
              {{ getApprovalText(row.approvalStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openSummaryDetail(row)">查看总结</el-button>
            <el-button link type="primary" @click="handleViewActivity(row.activityId)">查看活动</el-button>
            <!-- 待审批时显示通过、驳回（兼容 approvalStatus 大小写） -->
            <template v-if="isPending(row)">
              <el-button link type="success" @click="handleApprove(row)">通过</el-button>
              <el-button link type="danger" @click="openRejectDialog(row)">驳回</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 16px; justify-content: flex-end"
        @size-change="loadData"
        @current-change="loadData"
      />
      <el-empty v-if="!loading && list.length === 0" description="暂无活动总结" />

    <!-- 活动总结详情弹窗（与提交表单一致的字段展示） -->
    <el-dialog
      v-model="detailVisible"
      title="活动总结"
      width="700px"
      destroy-on-close
      class="summary-detail-dialog"
    >
      <div v-if="currentSummary" class="summary-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="活动标题">{{ currentSummary.activityTitle || '—' }}</el-descriptions-item>
          <el-descriptions-item label="实际参与人数">{{ currentSummary.actualParticipants != null ? currentSummary.actualParticipants : '—' }}</el-descriptions-item>
          <el-descriptions-item label="活动总结">
            <div class="summary-text">{{ currentSummary.summaryContent || '—' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="活动成果">
            <div class="summary-text">{{ currentSummary.achievements || '—' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="活动照片">
            <template v-if="parsedPhotos(currentSummary).length">
              <div class="photo-list">
                <template v-for="(url, idx) in parsedPhotos(currentSummary)" :key="idx">
                  <el-image
                    v-if="isValidImageUrl(url)"
                    :src="url"
                    fit="cover"
                    class="summary-photo"
                    :preview-src-list="validPhotoUrls(currentSummary)"
                  >
                    <template #error>
                      <div class="summary-photo-error">
                        <el-icon><Picture /></el-icon>
                        <span>图片加载失败</span>
                      </div>
                    </template>
                  </el-image>
                  <div v-else class="summary-photo summary-photo-invalid" title="链接无效或已过期">
                    <el-icon><Picture /></el-icon>
                    <span>图片不可用</span>
                  </div>
                </template>
              </div>
            </template>
            <span v-else>—</span>
          </el-descriptions-item>
          <el-descriptions-item label="附件">
            <template v-if="parsedAttachments(currentSummary).length">
              <div class="attachment-list">
                <div v-for="(item, idx) in parsedAttachments(currentSummary)" :key="idx" class="attachment-item">
                  <span class="attachment-name">{{ item.name }}</span>
                  <template v-if="item.url">
                    <el-link type="primary" :href="item.url" target="_blank" class="attachment-link">查看</el-link>
                    <el-link type="primary" :href="item.url" target="_blank" :download="item.name" class="attachment-link">下载</el-link>
                  </template>
                  <span v-else class="attachment-no-url">（无可下载链接）</span>
                </div>
              </div>
            </template>
            <span v-else>—</span>
          </el-descriptions-item>
          <el-descriptions-item label="审批状态">
            <el-tag :type="getApprovalType(currentSummary.approvalStatus)" size="small">
              {{ getApprovalText(currentSummary.approvalStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatDateTime(currentSummary.createTime) }}</el-descriptions-item>
          <el-descriptions-item v-if="currentSummary.reviewComment" label="审批意见">
            {{ currentSummary.reviewComment }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleViewActivity(currentSummary?.activityId)">查看活动</el-button>
      </template>
    </el-dialog>

    <!-- 驳回意见弹窗 -->
    <el-dialog
      v-model="rejectVisible"
      title="驳回活动总结"
      width="480px"
      destroy-on-close
      @close="rejectComment = ''; rejectSummaryId = null"
    >
      <el-form label-width="80px">
        <el-form-item label="审批意见">
          <el-input
            v-model="rejectComment"
            type="textarea"
            :rows="4"
            placeholder="请输入驳回原因（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" :loading="reviewing" @click="handleReject">确认驳回</el-button>
      </template>
    </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { getActivitySummaries, reviewActivitySummary } from '@/api/modules/activity'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const list = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const detailVisible = ref(false)
const currentSummary = ref(null)
const rejectVisible = ref(false)
const rejectComment = ref('')
const rejectSummaryId = ref(null)
const reviewing = ref(false)

const getApprovalText = (status) => {
  const map = { PENDING: '待审批', APPROVED: '已通过', REJECTED: '已拒绝' }
  return map[status] || status || '—'
}

const getApprovalType = (status) => {
  const map = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' }
  return map[status] || 'info'
}

/** 是否为待审批（兼容接口返回 PENDING / pending 或仅显示为待审批） */
const isPending = (row) => {
  const s = row?.approvalStatus
  if (s != null && s !== '') {
    if (String(s).toUpperCase() === 'PENDING') return true
  }
  return getApprovalText(s) === '待审批'
}

function parseJsonArray(str) {
  if (!str || typeof str !== 'string') return []
  try {
    const arr = JSON.parse(str)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

const parsedPhotos = (row) => {
  const arr = parseJsonArray(row?.photos)
  return arr.filter(Boolean)
}

const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  return url.startsWith('http://') || url.startsWith('https://')
}

const validPhotoUrls = (row) => {
  return parsedPhotos(row).filter(isValidImageUrl)
}

const parsedAttachments = (row) => {
  const arr = parseJsonArray(row?.attachments)
  if (!arr.length) return []
  return arr.map((item) => {
    if (item && typeof item === 'object' && item.name != null) {
      return { name: item.name, url: item.url || null }
    }
    if (typeof item === 'string') {
      return { name: item, url: null }
    }
    return null
  }).filter(Boolean)
}

const hasPhotosOrAttachments = (row) => {
  const p = parsedPhotos(row).length
  const a = parsedAttachments(row).length
  if (p && a) return `${p} 张 / ${a} 个`
  if (p) return `${p} 张照片`
  if (a) return `${a} 个附件`
  return '—'
}

const openSummaryDetail = (row) => {
  currentSummary.value = row
  detailVisible.value = true
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getActivitySummaries({ pageNum: pageNum.value, pageSize: pageSize.value })
    if (res && Array.isArray(res.list)) {
      list.value = res.list
      total.value = res.total != null ? res.total : 0
    } else {
      list.value = []
      total.value = 0
    }
  } catch (e) {
    ElMessage.error(e?.message || '加载活动总结失败')
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleViewActivity = (activityId) => {
  if (activityId) router.push(`/activities/${activityId}`)
}

const openRejectDialog = (row) => {
  rejectSummaryId.value = row.id
  rejectComment.value = ''
  rejectVisible.value = true
}

const handleApprove = async (row) => {
  try {
    await reviewActivitySummary(row.id, { approvalStatus: 'APPROVED' })
    ElMessage.success('已通过')
    loadData()
  } catch (e) {
    ElMessage.error(e?.message || '操作失败')
  }
}

const handleReject = async () => {
  if (!rejectSummaryId.value) return
  reviewing.value = true
  try {
    await reviewActivitySummary(rejectSummaryId.value, {
      approvalStatus: 'REJECTED',
      reviewComment: rejectComment.value || undefined
    })
    ElMessage.success('已驳回')
    rejectVisible.value = false
    rejectSummaryId.value = null
    rejectComment.value = ''
    loadData()
  } catch (e) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    reviewing.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.activity-summary-list {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-detail-dialog .summary-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.summary-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}

.photo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.summary-photo {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  cursor: pointer;
}

.summary-photo-error,
.summary-photo-invalid {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
  font-size: 12px;
}

.summary-photo-error .el-icon,
.summary-photo-invalid .el-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.summary-photo-invalid {
  cursor: default;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: #606266;
}

.attachment-name {
  margin-right: 4px;
}

.attachment-link {
  margin-right: 8px;
}

.attachment-no-url {
  color: #909399;
  font-size: 12px;
}
</style>
