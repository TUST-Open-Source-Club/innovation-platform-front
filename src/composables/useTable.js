/**
 * 通用组合式函数 - 表格处理
 * 统一使用 pageNum / pageSize 作为分页参数
 */
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export function useTable(loadDataFn, options = {}) {
  const {
    immediate = true,
    pageSize = 10
  } = options

  const tableData = ref([])
  const loading = ref(false)
  const page = ref(1)
  const size = ref(pageSize)
  const total = ref(0)

  /**
   * 加载数据
   * 统一使用 pageNum / pageSize 作为分页参数
   */
  const loadData = async (params = {}) => {
    loading.value = true
    try {
      const result = await loadDataFn({
        pageNum: page.value,
        pageSize: size.value,
        ...params
      })
      
      // 处理分页结果格式：{ pageNum, pageSize, total, totalPages, list }
      if (result && result.list) {
        tableData.value = result.list
        total.value = result.total || 0
      } else if (result && result.data) {
        // 兼容旧格式：{ data, total }
        tableData.value = result.data
        total.value = result.total || 0
      } else if (Array.isArray(result)) {
        // 列表结果
        tableData.value = result
        total.value = result.length
      } else {
        tableData.value = []
        total.value = 0
      }
    } catch (error) {
      ElMessage.error(error.message || '加载数据失败')
      tableData.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新数据
   */
  const refresh = () => {
    loadData()
  }

  /**
   * 改变页码
   */
  const handlePageChange = (newPage) => {
    page.value = newPage
    loadData()
  }

  /**
   * 改变每页数量
   */
  const handleSizeChange = (newSize) => {
    size.value = newSize
    page.value = 1
    loadData()
  }

  /**
   * 搜索
   */
  const search = (params) => {
    page.value = 1
    loadData(params)
  }

  if (immediate) {
    onMounted(() => {
      loadData()
    })
  }

  return {
    tableData,
    loading,
    page,
    size,
    total,
    loadData,
    refresh,
    handlePageChange,
    handleSizeChange,
    search
  }
}
