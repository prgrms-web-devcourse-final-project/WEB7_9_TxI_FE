import type { SeatMapConfig, SeatSection } from './types'

export const seatMap: Record<SeatSection, SeatMapConfig> = {
  vip: { rows: 3, seatsPerRow: 8, label: 'VIP석', color: 'text-yellow-500' },
  r: { rows: 5, seatsPerRow: 12, label: 'R석', color: 'text-blue-500' },
  s: { rows: 6, seatsPerRow: 14, label: 'S석', color: 'text-green-500' },
  a: { rows: 8, seatsPerRow: 16, label: 'A석', color: 'text-purple-500' },
}

export const seatPrices: Record<SeatSection, number> = {
  vip: 150000,
  r: 99000,
  s: 79000,
  a: 59000,
}
