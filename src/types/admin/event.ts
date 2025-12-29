import type { EventCategory, EventStatus } from '@/types/event'

export interface EventCreateRequest {
  title: string
  category: EventCategory
  description?: string
  place: string
  imageUrl?: string
  minPrice: number
  maxPrice: number
  preOpenAt: string       
  preCloseAt: string
  ticketOpenAt: string
  ticketCloseAt: string
  eventDate: string
  maxTicketAmount: number
}

export interface EventUpdateRequest {
  title: string
  category: EventCategory
  description?: string
  place: string
  imageUrl?: string
  minPrice: number
  maxPrice: number
  preOpenAt: string
  preCloseAt: string
  ticketOpenAt: string
  ticketCloseAt: string
  eventDate: string
  maxTicketAmount: number
  status: EventStatus
}

export interface EventResponse {
  id: number
  title: string
  category: EventCategory
  description?: string
  place: string
  imageUrl?: string
  minPrice: number
  maxPrice: number
  preOpenAt: string
  preCloseAt: string
  ticketOpenAt: string
  ticketCloseAt: string
  eventDate: string
  maxTicketAmount: number
  status: EventStatus
  deleted?: boolean
}

export interface AdminEventDashboardResponse {
  eventId: number
  title: string
  status: EventStatus
  preRegisterCount: number
  totalSoldSeats: number
  totalSalesAmount: number
  deleted?: boolean
}
