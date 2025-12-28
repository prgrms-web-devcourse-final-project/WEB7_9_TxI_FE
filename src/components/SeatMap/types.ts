import type { Seat } from '@/api/seats'

export interface SeatMapProps {
  seats: Seat[]
  selectedGrade: string
  selectedSeatIds: number[]
  onSeatClick: (seatId: number) => void
}
