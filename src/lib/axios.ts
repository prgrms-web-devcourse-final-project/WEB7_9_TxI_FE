import { useAuthStore } from '@/stores/authStore'
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.waitfair.shop/api/v1',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 공개 엔드포인트 목록 (인증 없이 접근 가능)
const PUBLIC_ENDPOINTS = [
  '/events', // 이벤트 목록 조회
  /^\/events\/\d+$/, // 이벤트 단건 조회 (/events/{id})
  /^\/events\/\d+\/pre-registers\/count$/, // 사전등록 수 조회 (/events/{id}/pre-registers/count)
]

// URL이 공개 엔드포인트인지 확인
const isPublicEndpoint = (url: string | undefined): boolean => {
  if (!url) return false

  // baseURL을 제거하고 경로만 추출
  const path = url.replace(import.meta.env.VITE_API_BASE_URL || 'https://api.waitfair.shop/api/v1', '')

  return PUBLIC_ENDPOINTS.some((endpoint) => {
    if (typeof endpoint === 'string') {
      return path.startsWith(endpoint)
    }
    return endpoint.test(path)
  })
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 공개 엔드포인트는 Authorization 헤더를 추가하지 않음
    if (isPublicEndpoint(config.url)) {
      return config
    }

    const accessToken = useAuthStore.getState().accessToken
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError<{ status: string; message: string; data?: unknown }>) => {
    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message))
    }

    return Promise.reject(error)
  },
)
