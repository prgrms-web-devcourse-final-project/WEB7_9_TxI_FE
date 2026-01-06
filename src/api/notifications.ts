import { apiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { NotificationDTO } from '@/types/notification'

export const notificationApi = {
  getNotifications: async (): Promise<ApiResponse<NotificationDTO[]>> => {
    const response = await apiClient.get<ApiResponse<NotificationDTO[]>>('../v2/notifications')

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw new Error(response.data.message)
    }

    return response.data
  },

  markAsRead: async (notificationId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.patch<ApiResponse<void>>(
      `../v2/notifications/${notificationId}/read`,
    )

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw new Error(response.data.message)
    }

    return response.data
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.patch<ApiResponse<void>>('../v2/notifications/read-all')

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw new Error(response.data.message)
    }

    return response.data
  },
}
