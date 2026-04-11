<template>
  <div class="cas-callback-container">
    <div class="loading-content">
      <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
      <h2>正在处理登录...</h2>
      <p v-if="message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { validateCasTicket } from '@/api/modules/cas'
import { useUserStore } from '@/stores/user'
import { setToken, setUser } from '@/utils/storage'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const message = ref('')

onMounted(async () => {
  const ticket = route.query.ticket
  
  if (!ticket) {
    ElMessage.error('登录失败：缺少必要的参数')
    router.push('/login')
    return
  }

  try {
    message.value = '正在验证身份...'
    const res = await validateCasTicket(ticket)
    
    if (res.code !== 200) {
      ElMessage.error(res.message || '登录验证失败')
      router.push('/login')
      return
    }

    const data = res.data

    // 处理需要合并账号的情况
    if (data.needMerge) {
      // 保存临时信息到 sessionStorage，供合并页面使用
      sessionStorage.setItem('cas_merge_data', JSON.stringify({
        casUid: data.casUid,
        casName: data.casName,
        duplicateAccount: data.duplicateAccount
      }))
      router.push('/cas-merge')
      return
    }

    // 处理登录成功
    if (data.token) {
      // 保存 token 和用户信息
      setToken(data.token)
      setUser(data.user)
      userStore.token = data.token
      userStore.setUser(data.user)

      // 检查是否需要完善资料
      if (data.needCompleteProfile) {
        ElMessage.success('登录成功，请先完善您的资料')
        router.push('/complete-profile')
      } else {
        ElMessage.success('登录成功')
        router.push('/dashboard')
      }
    } else {
      ElMessage.error('登录失败：未获取到有效的认证信息')
      router.push('/login')
    }
  } catch (error) {
    console.error('CAS登录处理失败:', error)
    ElMessage.error('登录处理失败: ' + (error.message || '未知错误'))
    router.push('/login')
  }
})
</script>

<style scoped>
.cas-callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
}

.loading-content {
  text-align: center;
  color: white;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.loading-icon {
  animation: rotate 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-content h2 {
  font-size: 24px;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.loading-content p {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}
</style>
