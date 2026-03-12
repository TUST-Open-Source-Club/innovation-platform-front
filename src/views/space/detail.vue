/**
 * 空间详情页
 */
<template>
  <div class="space-detail" v-loading="loading">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ space?.name }}</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="空间名称">{{ space?.name }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(space?.status)">{{ getStatusText(space?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="位置">{{ space?.location }}</el-descriptions-item>
        <el-descriptions-item label="容量">{{ space?.capacity }}人</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ space?.description }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>预约状态</el-divider>
      
      <el-calendar v-model="selectedDate">
        <template #date-cell="{ data }">
          <div class="calendar-cell">
            <div class="date">{{ data.day.split('-').slice(2).join('-') }}</div>
            <div v-if="getReservationsForDate(data.day).length > 0" class="reservations">
              <el-tag
                v-for="reservation in getReservationsForDate(data.day)"
                :key="reservation.id"
                size="small"
                :type="getStatusType(reservation.status)"
                class="reservation-tag"
              >
                {{ formatTime(reservation.startTime) }}-{{ formatTime(reservation.endTime) }}
              </el-tag>
            </div>
          </div>
        </template>
      </el-calendar>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getSpaceById, getSpaceReservations } from '@/api/modules/space'
import { STATUS_TEXT, STATUS_TYPE } from '@/constants'
import { formatTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const space = ref(null)
const reservations = ref([])
const loading = ref(false)
const selectedDate = ref(new Date())

const getStatusText = (status) => STATUS_TEXT[status] || status
const getStatusType = (status) => STATUS_TYPE[status] || ''

const getReservationsForDate = (dayStr) => {
  if (!dayStr) return []
  // dayStr 可能是 "2024-01-15" 或 "15"，需统一格式比较
  return reservations.value.filter(r => {
    const resDate = r.reservationDate
    if (!resDate) return false
    const resStr = String(resDate).slice(0, 10) // 确保格式一致
    if (dayStr.includes('-')) {
      return resStr === dayStr
    }
    // dayStr 仅为日期数字时，与 selectedDate 的月组合
    const d = selectedDate.value
    const cellDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(dayStr).padStart(2, '0')}`
    return resStr === cellDate
  })
}

const goBack = () => {
  router.back()
}

const loadData = async () => {
  const id = route.params.id
  loading.value = true
  try {
    space.value = await getSpaceById(id)
    reservations.value = await getSpaceReservations(id)
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.space-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.date {
  font-weight: bold;
  margin-bottom: 5px;
}

.reservations {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reservation-tag {
  font-size: 10px;
  padding: 0 4px;
}
</style>
