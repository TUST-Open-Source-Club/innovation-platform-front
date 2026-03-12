/**
 * 通用组合式函数 - 分页处理
 */
import { ref, computed } from 'vue'

export function usePagination(initialPage = 1, initialSize = 10) {
  const page = ref(initialPage)
  const size = ref(initialSize)
  const total = ref(0)

  /**
   * 总页数
   */
  const totalPages = computed(() => {
    return Math.ceil(total.value / size.value)
  })

  /**
   * 重置分页
   */
  const resetPagination = () => {
    page.value = initialPage
    total.value = 0
  }

  /**
   * 改变页码
   */
  const changePage = (newPage) => {
    page.value = newPage
  }

  /**
   * 改变每页数量
   */
  const changeSize = (newSize) => {
    size.value = newSize
    page.value = 1
  }

  return {
    page,
    size,
    total,
    totalPages,
    resetPagination,
    changePage,
    changeSize
  }
}
