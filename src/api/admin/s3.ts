import { apiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { PresignedUrlResponse } from '@/types/admin/s3'

export const adminS3Api = {
  issueEventImageUploadUrl: async (
    fileName: string,
  ): Promise<ApiResponse<PresignedUrlResponse>> => {
    const response = await apiClient.post<ApiResponse<PresignedUrlResponse>>(
      `/admin/images/events/upload-url`,
      null,
      {
        params: { fileName },
      },
    )

    if (response.data.status === '400 BAD_REQUEST') {
      throw Error(response.data.message)
    }

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },
}

