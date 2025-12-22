export type SeatSection = 'vip' | 'r' | 's' | 'a'

export interface SeatMapConfig {
  rows: number
  seatsPerRow: number
  label: string
  color: string
}

export interface SeatMapProps {
  section: SeatSection
  selectedSeats: string[]
  occupiedSeats: Set<string>
  onSeatClick: (seatId: string) => void
  maxSeats?: number
}
