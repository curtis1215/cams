import axios from 'axios'
import { message } from 'ant-design-vue'
import storage from '@/services/storage'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000
})

// 請求攔截器
request.interceptors.request.use(
  (config) => {
    const user = storage.get('user')
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 響應攔截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      message.error(res.message || '請求失敗')
      return Promise.reject(new Error(res.message || '請求失敗'))
    }
    return res
  },
  (error) => {
    message.error(error.message || '請求失敗')
    return Promise.reject(error)
  }
)

export default request 