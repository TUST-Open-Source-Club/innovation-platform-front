/**
 * 通用组合式函数 - 路由处理
 */
import { useRouter, useRoute } from 'vue-router'

export function useRouterHelper() {
  const router = useRouter()
  const route = useRoute()

  /**
   * 跳转到指定路由
   */
  const navigateTo = (path, params = {}) => {
    router.push({ path, query: params })
  }

  /**
   * 返回上一页
   */
  const goBack = () => {
    router.back()
  }

  /**
   * 刷新当前页面
   */
  const refresh = () => {
    router.go(0)
  }

  /**
   * 获取路由参数
   */
  const getParam = (key) => {
    return route.params[key] || route.query[key]
  }

  /**
   * 获取所有路由参数
   */
  const getParams = () => {
    return { ...route.params, ...route.query }
  }

  return {
    router,
    route,
    navigateTo,
    goBack,
    refresh,
    getParam,
    getParams
  }
}
