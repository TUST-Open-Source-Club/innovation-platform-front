/**
 * 页面头部组件
 */
<template>
  <div class="page-header">
    <div class="header-left">
      <h2 v-if="title">{{ title }}</h2>
      <slot name="title" />
    </div>
    <div class="header-right">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.header-right {
  display: flex;
  gap: 10px;
}
</style>
