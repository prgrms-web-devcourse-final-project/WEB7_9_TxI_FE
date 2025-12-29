import { apiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'

export interface SmsSendRequest {
  phoneNumber: string
}

export interface SmsVerifyRequest {
  phoneNumber: string
  verificationCode: string
}

export interface SmsSendResponse {
  expiresInSeconds: number
}

export interface SmsVerifyResponse {
  verified: boolean
}

export const smsApi = {
  /**
   * SMS 인증번호 발송
   */
  sendVerificationCode: async (phoneNumber: string): Promise<ApiResponse<SmsSendResponse>> => {
    const response = await apiClient.post<ApiResponse<SmsSendResponse>>('/sms/send', {
      phoneNumber,
    })
    return response.data
  },

  /**
   * SMS 인증번호 검증
   */
  verifyCode: async (phoneNumber: string, verificationCode: string): Promise<ApiResponse<SmsVerifyResponse>> => {
    const response = await apiClient.post<ApiResponse<SmsVerifyResponse>>('/sms/verify', {
      phoneNumber,
      verificationCode,
    })
    return response.data
  },
}
