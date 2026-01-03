export type SeatStatus = 'AVAILABLE' | 'SOLD' | 'RESERVED'
export type SeatGrade = 'VIP' | 'R' | 'S' | 'A'

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
  eventId: number
  seatId: number
  seatCode: string
  currentStatus: SeatStatus
  price: number
  grade: string
}
