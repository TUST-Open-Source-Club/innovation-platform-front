/**
 * 搜索表单组件
 */
<template>
  <el-form :inline="true" :model="formData" class="search-form">
    <slot />
    <el-form-item>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, defineEmits } from 'vue'

const emit = defineEmits(['search', 'reset'])

const formData = reactive({})

const handleSearch = () => {
  emit('search', formData)
}

const handleReset = () => {
  Object.keys(formData).forEach(key => {
    formData[key] = ''
  })
  emit('reset')
}

defineExpose({
  formData
})
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>
