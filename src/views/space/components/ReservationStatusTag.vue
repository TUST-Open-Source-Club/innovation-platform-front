<template>
  <el-tag :type="tagType" size="small">
    {{ statusText }}
  </el-tag>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getSpaceSchedule } from '@/api/modules/space'

const props = defineProps({
  spaceId: {
    type: [Number, String],
    required: true
  },
  date: {
    type: String,
    default: ''
  },
  startTime: {
    type: String,
    default: ''
  },
  endTime: {
    type: String,
    default: ''
  }
})

const tagType = ref('info')
const statusText = ref('-')

// 检查时间段是否已被预约
const checkReservationStatus = async () => {
  if (!props.date || !props.startTime || !props.endTime) {
    statusText.value = '-'
    tagType.value = 'info'
    return
  }

  try {
    const schedule = await getSpaceSchedule(props.spaceId, props.date)
    
    // 规范化时间格式为 HH:mm
    const normalizeTime = (timeStr) => {
      if (!timeStr) return ''
      // 如果是 HH:mm:ss 格式，取前5位
      if (timeStr.length >= 5) {
        return timeStr.substring(0, 5)
      }
      return timeStr
    }
    
    const checkStart = normalizeTime(props.startTime)
    const checkEnd = normalizeTime(props.endTime)
    
    if (!checkStart || !checkEnd) {
      statusText.value = '-'
      tagType.value = 'info'
      return
    }
    
    // 检查时间段是否有冲突
    const hasConflict = schedule.some(item => {
      if (item.reservationStatus !== 'APPROVED') return false
      
      const itemStart = normalizeTime(item.startTime)
      const itemEnd = normalizeTime(item.endTime)
      
      // 检查时间段是否重叠：如果 checkEnd <= itemStart 或 checkStart >= itemEnd，则不重叠
      // 否则重叠
      return !(checkEnd <= itemStart || checkStart >= itemEnd)
    })

    if (hasConflict) {
      statusText.value = '已预约'
      tagType.value = 'danger'
    } else {
      statusText.value = '可预约'
      tagType.value = 'success'
    }
  } catch (error) {
    console.error('查询预约状态失败:', error)
    statusText.value = '查询失败'
    tagType.value = 'warning'
  }
}

// 监听属性变化
watch(
  () => [props.date, props.startTime, props.endTime],
  () => {
    checkReservationStatus()
  },
  { immediate: true }
)

onMounted(() => {
  checkReservationStatus()
})
</script>

<style scoped>
</style>
