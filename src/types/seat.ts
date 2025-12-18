export type SeatStatus = 'AVAILABLE' | 'SOLD' | 'RESERVED'

export interface Seat {
  id: number
  eventId: number
  seatCode: string
  grade: string
  price: number
  seatStatus: SeatStatus
}

export interface SeatListResponse {
  seats: Seat[]
}

export interface SeatStatusChangeEvent {
  seatId: number
  seatCode: string
  previousStatus: SeatStatus
  currentStatus: SeatStatus
  updatedAt: string
}
