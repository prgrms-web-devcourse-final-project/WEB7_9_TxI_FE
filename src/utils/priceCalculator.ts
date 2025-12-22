import { seatPrices } from '@/components/SeatMap/constants'
import type { SeatSection } from '@/components/SeatMap/types'

export function calculateTotalPrice(selectedSeats: string[]): number {
  return selectedSeats.reduce((sum, seatId) => {
    const section = seatId.split('-')[0] as SeatSection
    return sum + seatPrices[section]
  }, 0)
}
