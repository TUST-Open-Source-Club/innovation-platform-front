/**
 * 通用数据表格组件
 */
<template>
  <el-table
    :data="data"
    v-loading="loading"
    :border="border"
    :stripe="stripe"
    style="width: 100%"
    @selection-change="handleSelectionChange"
  >
    <el-table-column v-if="showSelection" type="selection" width="55" />
    <el-table-column v-if="showIndex" type="index" label="序号" width="60" />
    <slot />
  </el-table>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  showSelection: {
    type: Boolean,
    default: false
  },
  showIndex: {
    type: Boolean,
    default: false
  },
  border: {
    type: Boolean,
    default: true
  },
  stripe: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['selection-change'])

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}
</script>

<style scoped>
</style>
