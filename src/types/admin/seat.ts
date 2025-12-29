import type { SeatStatus } from '@/types/seat'

export type SeatGrade = 'VIP' | 'R' | 'S' | 'A' | 'B' | 'C'

export interface SeatCreateRequest {
  seatCode: string
  grade: SeatGrade
  price: number
}

export interface SeatUpdateRequest {
  seatCode: string
  grade: SeatGrade
  price: number
  seatStatus: SeatStatus
}

export interface AutoCreateSeatsRequest {
  rows: number
  cols: number
  defaultGrade: SeatGrade
  defaultPrice: number
}

export interface BulkCreateSeatsRequest {
  seats: SeatCreateRequest[]
}