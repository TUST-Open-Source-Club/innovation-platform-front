/**
 * 通用组合式函数 - 表单处理
 */
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

export function useForm(initialData = {}) {
  const formRef = ref(null)
  const loading = ref(false)
  const formData = reactive({ ...initialData })

  /**
   * 重置表单
   */
  const resetForm = () => {
    if (formRef.value) {
      formRef.value.resetFields()
    }
    Object.assign(formData, initialData)
  }

  /**
   * 验证表单
   */
  const validateForm = async () => {
    if (!formRef.value) return false
    try {
      await formRef.value.validate()
      return true
    } catch (error) {
      ElMessage.warning('请填写完整信息')
      return false
    }
  }

  /**
   * 提交表单
   * @param {Function} submitFn - 提交函数
   * @param {Object} options - 选项 { showSuccessMessage: true }
   */
  const submitForm = async (submitFn, options = {}) => {
    if (!(await validateForm())) {
      return false
    }

    loading.value = true
    try {
      await submitFn(formData)
      if (options.showSuccessMessage !== false) {
        ElMessage.success('操作成功')
      }
      return true
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    formRef,
    loading,
    formData,
    resetForm,
    validateForm,
    submitForm
  }
}
