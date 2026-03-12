<template>
  <div class="news-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑新闻' : '发布新闻' }}</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        style="max-width: 900px"
      >
        <el-form-item label="新闻标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入新闻标题" />
        </el-form-item>
        <el-form-item label="新闻分类" prop="categoryId">
          <el-select v-model="formData.categoryId" placeholder="选择分类" clearable>
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="封面图片">
          <el-upload
            class="cover-upload"
            :auto-upload="false"
            accept="image/*"
            :limit="1"
            :on-change="handleCoverChange"
            :on-remove="handleCoverRemove"
            :file-list="coverFileList"
          >
            <template #trigger>
              <el-button type="primary">选择封面图片</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">支持 jpg、png、gif 等图片，单张上传</div>
            </template>
          </el-upload>
          <div v-if="formData.coverImage" class="cover-preview">
            <el-image :src="formData.coverImage" fit="contain" style="max-width: 200px; max-height: 120px" />
          </div>
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <el-input
            v-model="formData.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入新闻摘要"
          />
        </el-form-item>
        <el-form-item label="正文内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="10"
            placeholder="请输入新闻正文内容"
          />
        </el-form-item>
        <el-form-item label="来源">
          <el-select
            v-model="formData.relatedActivityId"
            placeholder="选择来源"
            clearable
            @change="onSourceChange"
          >
            <el-option
              v-for="activity in activities"
              :key="activity.id"
              :label="activity.title"
              :value="activity.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            v-model:file-list="fileList"
            action="#"
            :auto-upload="false"
            :limit="5"
            :on-remove="handleRemoveFile"
            :on-change="handleFileChange"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">最多上传5个附件</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存草稿</el-button>
          <el-button type="success" :loading="submitting" @click="handleSubmit">提交审核</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createNews, updateNews, submitNews, getNewsById } from '@/api/modules/news'
import { getNewsCategories } from '@/api/modules/common'
import { getActivities } from '@/api/modules/activity'
import { useForm } from '@/composables/useForm'

const route = useRoute()
const router = useRouter()

const isEdit = ref(false)
const saving = ref(false)
const submitting = ref(false)
const categories = ref([])
const activities = ref([])
const fileList = ref([])
const coverFileList = ref([])

const { formRef, formData, submitForm } = useForm({
  title: '',
  categoryId: null,
  coverImage: '',
  summary: '',
  content: '',
  source: '',
  relatedActivityId: null,
  attachments: ''
})

const formRules = {
  title: [{ required: true, message: '请输入新闻标题', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入新闻摘要', trigger: 'blur' }],
  content: [{ required: true, message: '请输入新闻正文内容', trigger: 'blur' }]
}

const goBack = () => {
  router.back()
}

const handleCoverChange = (file) => {
  if (!file.raw || !file.raw.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.coverImage = e.target.result
  }
  reader.readAsDataURL(file.raw)
  coverFileList.value = [file]
}

const handleCoverRemove = () => {
  formData.coverImage = ''
  coverFileList.value = []
}

const onSourceChange = (activityId) => {
  if (activityId == null) {
    formData.source = ''
    return
  }
  const activity = activities.value.find(a => a.id === activityId)
  formData.source = activity ? activity.title : ''
}

const handleFileChange = (file) => {
  // 文件选择处理
}

const handleRemoveFile = (file) => {
  // 文件移除处理
}

const handleSave = async () => {
  const success = await submitForm(async (data) => {
    // 处理附件
    const attachments = fileList.value.map(file => file.name)
    data.attachments = JSON.stringify(attachments)
    
    saving.value = true
    try {
      if (isEdit.value) {
        await updateNews(route.params.id, data)
        ElMessage.success('新闻已保存')
      } else {
        await createNews(data)
        ElMessage.success('新闻草稿已保存')
      }
      router.push('/news')
    } catch (error) {
      ElMessage.error(error.message || '保存失败')
    } finally {
      saving.value = false
    }
  }, { showSuccessMessage: false })
}

const handleSubmit = async () => {
  const success = await submitForm(async (data) => {
    // 处理附件
    const attachments = fileList.value.map(file => file.name)
    data.attachments = JSON.stringify(attachments)
    
    submitting.value = true
    try {
      if (isEdit.value) {
        // 先更新，再提交
        await updateNews(route.params.id, data)
        await submitNews(route.params.id)
      } else {
        // 先创建，再提交
        const news = await createNews(data)
        await submitNews(news.id)
      }
      ElMessage.success('新闻已提交审核')
      router.push('/news')
    } catch (error) {
      ElMessage.error(error.message || '提交失败')
    } finally {
      submitting.value = false
    }
  }, { showSuccessMessage: false })
}

const loadNews = async () => {
  if (route.params.id) {
    isEdit.value = true
    try {
      const news = await getNewsById(route.params.id)
      Object.assign(formData, {
        title: news.title,
        categoryId: news.categoryId,
        coverImage: news.coverImage,
        summary: news.summary,
        content: news.content,
        source: news.source,
        relatedActivityId: news.relatedActivityId
      })
      if (news.coverImage) {
        coverFileList.value = [{ name: '封面图', url: news.coverImage }]
      }
      // 加载附件
      if (news.attachments) {
        try {
          const attachments = JSON.parse(news.attachments)
          fileList.value = attachments.map(name => ({ name }))
        } catch (e) {
          console.error('解析附件失败', e)
        }
      }
    } catch (error) {
      ElMessage.error('加载新闻信息失败')
    }
  }
}

const loadCategories = async () => {
  try {
    categories.value = await getNewsCategories() || []
  } catch (e) {
    console.error('加载新闻分类失败', e)
  }
}

const loadActivities = async () => {
  try {
    const result = await getActivities({ pageNum: 1, pageSize: 100, status: 'PUBLISHED' })
    activities.value = result?.list || result?.data || []
  } catch (e) {
    console.error('加载活动列表失败', e)
  }
}

onMounted(() => {
  loadNews()
  loadCategories()
  loadActivities()
})
</script>

<style scoped>
.news-form {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cover-upload {
  display: block;
}

.cover-preview {
  margin-top: 8px;
}
</style>
