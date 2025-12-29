import type { PreRegisterStatus } from '@/types/preRegister'

export interface PreRegisterListResponse {
  id: number
  userEmail: string
  createdAt: string
  preRegisterStatus: PreRegisterStatus
  ticketOpenAt: string
}

