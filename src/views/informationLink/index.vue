/**
 * 信息对接首页
 */
<template>
  <div class="information-link">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="link-card" @click="handleJoinTeam">
          <el-icon :size="40"><UserFilled /></el-icon>
          <h3>申请加入团队</h3>
          <p>学生可以申请加入项目团队</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="link-card" @click="handleTakeoverProject">
          <el-icon :size="40"><Document /></el-icon>
          <h3>接管项目</h3>
          <p>教师可以申请接管无人管理项目</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="link-card" @click="handleFundApplication">
          <el-icon :size="40"><Money /></el-icon>
          <h3>基金申请</h3>
          <p>项目负责人可以申请基金</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { UserFilled, Document, Money } from '@element-plus/icons-vue'

const router = useRouter()

const handleJoinTeam = () => {
  router.push('/teams')
}

const handleTakeoverProject = () => {
  router.push({ path: '/projects', query: { tab: 'unclaimed' } })
}

const handleFundApplication = () => {
  router.push('/fund-applications')
}
</script>

<style scoped>
.information-link {
  padding: 20px;
}

.link-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.link-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.link-card h3 {
  margin: 15px 0 10px;
}

.link-card p {
  color: #909399;
  font-size: 14px;
}
</style>
