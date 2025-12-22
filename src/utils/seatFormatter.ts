import { seatMap } from '@/components/SeatMap/constants'
import type { SeatSection } from '@/components/SeatMap/types'

export function parseSeatId(seatId: string) {
  const [section, row, seat] = seatId.split('-')
  return {
    section: section as SeatSection,
    row: Number.parseInt(row),
    seat: Number.parseInt(seat),
  }
}

export function formatSeatLabel(seatId: string): string {
  const { section, row, seat } = parseSeatId(seatId)
  const sectionLabel = seatMap[section].label
  const rowLabel = String.fromCharCode(65 + row)
  const seatNumber = seat + 1

  return `${sectionLabel} ${rowLabel}열 ${seatNumber}번`
}
