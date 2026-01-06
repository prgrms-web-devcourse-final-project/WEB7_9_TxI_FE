import { apiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import { getVisitorId } from '@/utils/fingerprint'

export interface SmsSendRequest {
  phoneNumber: string
  eventId: number
}

export interface SmsVerifyRequest {
  phoneNumber: string
  verificationCode: string
  eventId: number
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
  sendVerificationCode: async (
    phoneNumber: string,
    eventId: number
  ): Promise<ApiResponse<SmsSendResponse>> => {
    // Fingerprint visitorId 가져오기
    const visitorId = await getVisitorId()

    const response = await apiClient.post<ApiResponse<SmsSendResponse>>(
      '/sms/send',
      {
        phoneNumber,
        eventId,
      },
      {
        headers: {
          'X-Device-Id': visitorId,
        },
      }
    )
    return response.data
  },

  /**
   * SMS 인증번호 검증
   */
  verifyCode: async (
    phoneNumber: string,
    verificationCode: string,
    eventId: number
  ): Promise<ApiResponse<SmsVerifyResponse>> => {
    // Fingerprint visitorId 가져오기
    const visitorId = await getVisitorId()

    const response = await apiClient.post<ApiResponse<SmsVerifyResponse>>(
      '/sms/verify',
      {
        phoneNumber,
        verificationCode,
        eventId,
      },
      {
        headers: {
          'X-Device-Id': visitorId,
        },
      }
    )
    return response.data
  },
}
