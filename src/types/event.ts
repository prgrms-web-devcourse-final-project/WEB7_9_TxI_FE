export type EventStatus =
  | 'READY'
  | 'PRE_OPEN'
  | 'PRE_CLOSED'
  | 'QUEUE_READY'
  | 'OPEN'
  | 'CLOSED'
export type EventCategory = 'CONCERT' | 'POPUP' | 'DROP'

export interface Event {
  id: number
  title: string
  category: EventCategory
  description?: string
  place: string
  imageUrl: string
  minPrice: number
  maxPrice: number
  preOpenAt: string
  preCloseAt: string
  ticketOpenAt: string
  ticketCloseAt?: string
  maxTicketAmount?: number
  status: EventStatus
  createdAt?: string
  deleted?: boolean
}

export interface PageableRequest {
  page: number
  size: number
  sort?: string[]
}

export interface Sort {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export interface Pageable {
  offset: number
  sort: Sort
  paged: boolean
  pageNumber: number
  pageSize: number
  unpaged: boolean
}

export interface PageResponse<T> {
  totalElements: number
  totalPages: number
  size: number
  content: T[]
  number: number
  sort: Sort
  numberOfElements: number
  pageable: Pageable
  first: boolean
  last: boolean
  empty: boolean
}

export interface GetEventsParams {
  status?: EventStatus
  category?: EventCategory
  pageable: PageableRequest
}
