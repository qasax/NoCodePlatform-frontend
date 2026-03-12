import axios from 'axios'
import JSONBig from 'json-bigint'
import router from '@/router'

const JSONBigString = JSONBig({ storeAsString: true })

const myAxios = axios.create({
  baseURL: '/api',
  timeout: 60000,
  withCredentials: true,
  // Parse response: preserve large numbers (Long) as strings to avoid JS precision loss
  transformResponse: [
    (data) => {
      if (typeof data === 'string') {
        try {
          return JSONBigString.parse(data)
        } catch {
          return data
        }
      }
      return data
    },
  ],
  // Serialize request body: stringify with json-bigint so string-form large numbers
  // are sent as JSON numbers (not quoted strings) to the backend
  transformRequest: [
    (data, headers) => {
      const contentType = headers?.['Content-Type']
      if (data && typeof contentType === 'string' && contentType.includes('application/json')) {
        return JSONBigString.stringify(data)
      }
      return data
    },
  ],
})

// 请求拦截器
myAxios.interceptors.request.use(
  (config) => {
    // 可以在这里统一加上 Token 等
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
myAxios.interceptors.response.use(
  (response) => {
    const { data } = response
    // 如果返回 code 为 0 或 200 才是成功，且为业务响应
    if (data && data.code !== undefined) {
      if (data.code === 0 || data.code === 200) {
        return data.data
      } else {
        // 后端通常抛出 40100 表示未登录 (此为统一规范常见设定，具体也可做多状态扩充)
        if (data.code === 40100) {
          if (!window.location.pathname.includes('/user/login')) {
            router.push(`/user/login?redirect=${window.location.pathname}`)
          }
        }
        return Promise.reject(new Error(data.message || '请求失败'))
      }
    }
    return data
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default myAxios
