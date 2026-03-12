<template>
  <div class="activity-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑活动' : '创建活动' }}</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <div class="activity-form-inner">
        <div class="form-left">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="120px"
            style="max-width: 800px"
          >
            <el-form-item label="活动标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入活动标题" />
            </el-form-item>
            <el-form-item label="活动类型" prop="activityTypeId">
              <el-select v-model="formData.activityTypeId" placeholder="选择活动类型" clearable style="width: 100%">
                <el-option
                  v-for="type in activityTypes"
                  :key="type.id"
                  :label="type.name"
                  :value="type.id"
                />
                <el-option label="其他" value="OTHER" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="formData.activityTypeId === 'OTHER'" label="其他活动类型" prop="activityTypeOther">
              <el-input v-model="formData.activityTypeOther" placeholder="请输入其他活动类型" clearable />
            </el-form-item>
            <el-form-item label="活动系列" prop="activitySeries">
              <el-select v-model="formData.activitySeries" placeholder="选择活动系列" clearable style="width: 100%">
                <el-option label="先锋双创榜样" value="先锋双创榜样" />
                <el-option label="双创技术讲坛" value="双创技术讲坛" />
                <el-option label="企业家大讲堂" value="企业家大讲堂" />
              </el-select>
            </el-form-item>
            <el-form-item label="活动日期" prop="activityDate">
              <el-date-picker
                v-model="formData.activityDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :disabled-date="disabledDate"
                @change="onDateOrSpaceChange"
              />
            </el-form-item>
            <el-form-item label="活动地点" prop="spaceId">
              <el-select
                v-model="spaceSelectValue"
                placeholder="请选择活动地点（预约空间）"
                style="width: 100%"
                @change="onSpaceSelectChange"
              >
                <el-option
                  v-for="space in availableSpaces"
                  :key="space.id"
                  :label="space.name"
                  :value="space.id"
                />
                <el-option label="其他" value="OTHER" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="spaceSelectValue === 'OTHER'" label="其他地点" prop="location">
              <el-input v-model="formData.location" placeholder="请输入其他活动地点" clearable />
            </el-form-item>
            <el-form-item label="预约时间" prop="activityStartHour">
              <div class="time-slots-hint">请先选择活动日期和地点，再点击下方时段（已被占用的时段不可选）</div>
              <div class="time-slot-buttons">
                <el-button
                  v-for="h in hourSlots"
                  :key="h"
                  size="small"
                  :type="formData.activityStartHour === h ? 'primary' : 'default'"
                  :disabled="isHourDisabled(h)"
                  :class="{ 'is-occupied': isHourOccupied(h) }"
                  @click="selectStartHour(h)"
                >
                  {{ String(h).padStart(2, '0') }}:00
                </el-button>
              </div>
            </el-form-item>
            <el-form-item label="活动描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="3"
                placeholder="请输入活动描述"
              />
            </el-form-item>
            <el-form-item label="活动内容" prop="content">
              <el-input
                v-model="formData.content"
                type="textarea"
                :rows="5"
                placeholder="请输入活动详细内容"
              />
            </el-form-item>
            <el-form-item label="报名二维码" prop="qrCodeUrl">
              <el-upload
                class="qr-upload"
                :auto-upload="false"
                :show-file-list="false"
                accept="image/*"
                @change="onQrCodeChange"
              >
                <el-button type="primary" size="small">上传二维码</el-button>
              </el-upload>
              <div v-if="formData.qrCodeUrl" class="upload-preview">
                <img :src="formData.qrCodeUrl" alt="二维码" class="qr-preview-img" />
              </div>
            </el-form-item>
            <el-form-item label="主办单位" prop="hostUnitId">
              <el-select v-model="formData.hostUnitId" placeholder="选择主办单位" clearable style="width: 100%">
                <el-option
                  v-for="college in colleges"
                  :key="college.id"
                  :label="college.name"
                  :value="college.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="承办单位（可多选）" prop="coOrganizerIds">
              <div class="co-organizer-buttons">
                <el-button
                  v-for="college in colleges"
                  :key="college.id"
                  size="small"
                  :type="isCoOrganizerSelected(college.id) ? 'primary' : 'default'"
                  @click="toggleCoOrganizer(college.id)"
                >
                  {{ college.name }}
                </el-button>
              </div>
            </el-form-item>
            <el-form-item label="其他单位" prop="otherUnits">
              <el-input v-model="formData.otherUnits" placeholder="请输入其他单位" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="handleSave">保存草稿</el-button>
              <el-button type="success" :loading="submitting" @click="handleSubmit">提交审核</el-button>
              <el-button @click="goBack">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="form-spacer form-spacer-left" aria-hidden="true" />
        <div class="form-right">
          <div class="poster-area">
            <div class="poster-label">活动海报</div>
            <div v-if="formData.posterUrl" class="poster-preview">
              <img :src="formData.posterUrl" alt="海报" class="poster-img" />
            </div>
            <div v-else class="poster-placeholder">暂无海报</div>
            <template v-if="isAdmin">
              <el-upload
                class="poster-upload"
                :auto-upload="false"
                :show-file-list="false"
                accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp"
                :disabled="!isEdit || !route.params.id"
                @change="onPosterChange"
              >
                <el-button type="primary" size="small" :disabled="!isEdit || !route.params.id">
                  {{ formData.posterUrl ? '更换海报' : '上传海报' }}
                </el-button>
              </el-upload>
              <div v-if="!isEdit || !route.params.id" class="poster-tip">保存活动后可上传海报</div>
            </template>
            <div v-else class="poster-tip">仅学校管理员和学院管理员可上传海报</div>
          </div>
        </div>
        <div class="form-spacer form-spacer-right" aria-hidden="true" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createActivity, submitActivity, getActivityById, updateActivity, uploadActivityPoster } from '@/api/modules/activity'
import { getActivityTypes } from '@/api/modules/common'
import { getSpaces, getSpaceOccupiedSlots } from '@/api/modules/space'
import { getColleges } from '@/api/modules/common'
import { uploadFile } from '@/api/modules/upload'
import { useForm } from '@/composables/useForm'
import { usePermission } from '@/composables/usePermission'

const route = useRoute()
const router = useRouter()
const { isAdmin } = usePermission()

const isEdit = ref(false)
const activityTypes = ref([])
const availableSpaces = ref([])
const colleges = ref([])
const saving = ref(false)
const submitting = ref(false)
const spaceSelectValue = ref(null)
const occupiedSlotsForDate = ref([])
const uploadingQr = ref(false)
const uploadingPoster = ref(false)

const hourSlots = Array.from({ length: 14 }, (_, i) => i + 8)
const { formRef, formData, submitForm, validateForm } = useForm({
  title: '',
  activityTypeId: null,
  activitySeries: '',
  activityTypeOther: '',
  organizerType: 'USER',
  startTime: '',
  endTime: '',
  activityDate: '',
  activityStartHour: null,
  spaceId: null,
  location: '',
  description: '',
  content: '',
  qrCodeUrl: '',
  hostUnitId: null,
  coOrganizerIds: '',
  otherUnits: '',
  posterUrl: '',
  maxParticipants: null
})

const coOrganizerIdList = computed({
  get() {
    if (!formData.coOrganizerIds || typeof formData.coOrganizerIds !== 'string') return []
    return formData.coOrganizerIds.split(',').map(s => s.trim()).filter(Boolean).map(Number)
  },
  set(ids) {
    formData.coOrganizerIds = Array.isArray(ids) ? ids.join(',') : ''
  }
})

const isCoOrganizerSelected = (id) => coOrganizerIdList.value.includes(Number(id))

const toggleCoOrganizer = (id) => {
  const numId = Number(id)
  const list = [...coOrganizerIdList.value]
  const idx = list.indexOf(numId)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(numId)
  formData.coOrganizerIds = list.join(',')
}

const occupiedHoursSet = computed(() => {
  const set = new Set()
  const list = occupiedSlotsForDate.value || []
  for (const r of list) {
    const s = String(r.startTime || '')
    const e = String(r.endTime || '')
    const startH = parseInt(s.split(':')[0], 10)
    let endH = parseInt(e.split(':')[0], 10)
    const endMin = parseInt(e.split(':')[1], 10) || 0
    if (endMin > 0) endH += 1
    for (let h = startH; h < endH; h++) set.add(h)
  }
  return set
})
const isHourOccupied = (h) => occupiedHoursSet.value.has(h)
const isHourDisabled = (h) => isHourOccupied(h)
const selectStartHour = (h) => {
  formData.activityStartHour = h
  formData.startTime = `${formData.activityDate}T${String(h).padStart(2, '0')}:00:00`
  formData.endTime = `${formData.activityDate}T${String(h + 1).padStart(2, '0')}:00:00`
}
const onSpaceSelectChange = (val) => {
  if (val === 'OTHER') {
    formData.spaceId = null
    formData.location = ''
  } else {
    formData.spaceId = val
    const space = availableSpaces.value.find(s => s.id === val)
    formData.location = space ? space.name : ''
  }
  onDateOrSpaceChange()
}
const onDateOrSpaceChange = () => {
  formData.activityStartHour = null
  formData.startTime = ''
  formData.endTime = ''
  loadOccupiedSlots()
}
const loadOccupiedSlots = async () => {
  const spaceId = formData.spaceId
  const date = formData.activityDate
  if (!spaceId || !date) {
    occupiedSlotsForDate.value = []
    return
  }
  try {
    const list = await getSpaceOccupiedSlots(spaceId, date)
    occupiedSlotsForDate.value = Array.isArray(list) ? list : []
  } catch (e) {
    occupiedSlotsForDate.value = []
  }
}
const disabledDate = (time) => time.getTime() < Date.now() - 8.64e7

const onQrCodeChange = async (fileItem) => {
  const file = fileItem?.raw || fileItem
  if (!file) return
  uploadingQr.value = true
  try {
    const url = await uploadFile(file, 'activity-qrcode')
    formData.qrCodeUrl = url
    ElMessage.success('二维码上传成功')
  } catch (e) {
    ElMessage.error(e?.message || '上传失败')
  } finally {
    uploadingQr.value = false
  }
}

const onPosterChange = async (fileItem) => {
  const file = fileItem?.raw || fileItem
  if (!file || !route.params.id) return
  uploadingPoster.value = true
  try {
    const activity = await uploadActivityPoster(route.params.id, file)
    formData.posterUrl = activity.posterUrl
    ElMessage.success('海报上传成功')
  } catch (e) {
    ElMessage.error(e?.message || '上传失败')
  } finally {
    uploadingPoster.value = false
  }
}

const validateLocation = (rule, value, callback) => {
  if (spaceSelectValue.value === 'OTHER') {
    if (!formData.location?.trim()) callback(new Error('请输入其他活动地点'))
    else callback()
  } else {
    if (formData.spaceId == null) callback(new Error('请选择活动地点'))
    else callback()
  }
}

const formRules = {
  title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
  activityDate: [{ required: true, message: '请选择活动日期', trigger: 'change' }],
  spaceId: [{ validator: validateLocation, trigger: 'change' }],
  activityStartHour: [{ required: true, message: '请选择预约时间', trigger: 'change' }],
  location: [
    { validator: (rule, v, cb) => { if (spaceSelectValue.value === 'OTHER' && !(v && v.trim())) cb(new Error('请输入其他活动地点')); else cb(); }, trigger: 'blur' }
  ]
}

const goBack = () => {
  router.back()
}

const buildSubmitData = (data) => {
  const d = { ...data }
  if (d.activityDate && d.activityStartHour != null) {
    d.startTime = `${d.activityDate}T${String(d.activityStartHour).padStart(2, '0')}:00:00`
    d.endTime = `${d.activityDate}T${String(d.activityStartHour + 1).padStart(2, '0')}:00:00`
  }
  d.spaceId = spaceSelectValue.value === 'OTHER' ? null : formData.spaceId
  d.location = formData.location?.trim() || (d.spaceId ? (availableSpaces.value.find(s => s.id === d.spaceId)?.name || '') : '')
  if (d.activityTypeId === 'OTHER') {
    d.activityTypeId = null
    d.activityTypeOther = d.activityTypeOther?.trim() || null
  } else {
    d.activityTypeOther = null
  }
  d.hostUnitId = d.hostUnitId || null
  d.coOrganizerIds = formData.coOrganizerIds || null
  d.otherUnits = d.otherUnits?.trim() || null
  d.qrCodeUrl = d.qrCodeUrl || null
  return d
}

const handleSave = async () => {
  const valid = await validateForm()
  if (!valid) return
  const payload = buildSubmitData(formData)
  if (!payload.startTime || !payload.endTime) {
    ElMessage.warning('请选择活动日期和预约时间')
    return
  }
  saving.value = true
  try {
    if (isEdit.value && route.params.id) {
      await updateActivity(route.params.id, payload)
      ElMessage.success('活动已更新')
    } else {
      await createActivity(payload)
      ElMessage.success('活动草稿已保存')
    }
    router.push('/activities')
  } catch (error) {
    ElMessage.error(error?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleSubmit = async () => {
  const valid = await validateForm()
  if (!valid) return
  const payload = buildSubmitData(formData)
  if (!payload.startTime || !payload.endTime) {
    ElMessage.warning('请选择活动日期和预约时间')
    return
  }
  submitting.value = true
  try {
    let activityId
    if (isEdit.value && route.params.id) {
      await updateActivity(route.params.id, payload)
      activityId = route.params.id
      await submitActivity(activityId)
    } else {
      const activity = await createActivity(payload)
      activityId = activity.id
      await submitActivity(activityId)
    }
    ElMessage.success('活动已提交审核')
    router.push('/activities')
  } catch (error) {
    ElMessage.error(error?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

const loadActivityTypes = async () => {
  try {
    const data = await getActivityTypes()
    activityTypes.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('加载活动类型失败:', error)
    activityTypes.value = []
  }
}

const loadColleges = async () => {
  try {
    const list = await getColleges()
    colleges.value = Array.isArray(list) ? list : []
  } catch (e) {
    colleges.value = []
  }
}

const loadSpaces = async () => {
  try {
    const list = await getSpaces()
    availableSpaces.value = Array.isArray(list) ? list : []
  } catch (e) {
    availableSpaces.value = []
  }
}

const loadActivity = async () => {
  if (route.params.id) {
    isEdit.value = true
    try {
      const activity = await getActivityById(route.params.id)
      const startStr = activity.startTime || ''
      const datePart = startStr.slice(0, 10)
      const hourPart = startStr.slice(11, 13)
      const hour = hourPart ? parseInt(hourPart, 10) : null
      const hasOtherType = activity.activityTypeOther && !activity.activityTypeId
      Object.assign(formData, {
        title: activity.title,
        activityTypeId: hasOtherType ? 'OTHER' : activity.activityTypeId,
        activitySeries: activity.activitySeries || '',
        activityTypeOther: activity.activityTypeOther || '',
        startTime: activity.startTime,
        endTime: activity.endTime,
        activityDate: datePart || '',
        activityStartHour: hour,
        spaceId: activity.spaceId,
        location: activity.location || '',
        description: activity.description || '',
        content: activity.content || '',
        qrCodeUrl: activity.qrCodeUrl || '',
        hostUnitId: activity.hostUnitId || null,
        coOrganizerIds: activity.coOrganizerIds || '',
        otherUnits: activity.otherUnits || '',
        posterUrl: activity.posterUrl || '',
        maxParticipants: activity.maxParticipants
      })
      spaceSelectValue.value = activity.spaceId != null ? activity.spaceId : (activity.location ? 'OTHER' : null)
      if (formData.spaceId && formData.activityDate) loadOccupiedSlots()
    } catch (error) {
      ElMessage.error('加载活动信息失败')
    }
  }
}

onMounted(() => {
  loadActivityTypes()
  loadSpaces()
  loadColleges()
  loadActivity()
})
</script>

<style scoped>
.activity-form {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-form-inner {
  display: flex;
  gap: 0;
  align-items: flex-start;
}

.form-left {
  flex: 0 0 auto;
  max-width: 800px;
  min-width: 0;
  padding-right: 24px;
}

.form-spacer {
  flex: 1;
  min-width: 24px;
}

.form-right {
  flex: 0 0 auto;
  width: 420px;
  display: flex;
  justify-content: center;
}

.poster-area {
  position: sticky;
  top: 20px;
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 100%;
}

.poster-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.poster-preview {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: auto;
  background: #fff;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  max-width: 100%;
  max-height: min(85vh, 900px);
}

.poster-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  vertical-align: middle;
}

.poster-placeholder {
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 12px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
}

.poster-upload {
  margin-bottom: 4px;
}

.poster-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}

.time-slots-hint {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.time-slot-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.time-slot-buttons .el-button.is-occupied:disabled {
  background-color: #e4e7ed;
  border-color: #e4e7ed;
  color: #c0c4cc;
}

.co-organizer-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.qr-upload {
  margin-bottom: 8px;
}

.upload-preview {
  margin-top: 8px;
}

.qr-preview-img {
  max-width: 160px;
  max-height: 160px;
  display: block;
  border-radius: 4px;
  border: 1px solid var(--el-border-color);
}
</style>
