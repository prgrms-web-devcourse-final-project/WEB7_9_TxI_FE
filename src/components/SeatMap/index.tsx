import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { seatMap } from './constants'
import type { SeatMapProps } from './types'

export function SeatMap({
  section,
  selectedSeats,
  occupiedSeats,
  onSeatClick,
  maxSeats = 1,
}: SeatMapProps) {
  const config = seatMap[section]

  const handleSeatClick = (seatId: string) => {
    if (occupiedSeats.has(seatId)) return

    const isSelected = selectedSeats.includes(seatId)
    if (!isSelected && selectedSeats.length >= maxSeats) return

    onSeatClick(seatId)
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="bg-gradient-to-b from-blue-100 to-transparent py-3 text-center rounded-lg border border-blue-300 mb-8">
          <div className="text-sm font-semibold">무대</div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: config.rows }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex items-center gap-2">
              <div className="w-8 text-sm text-gray-600 text-center">
                {String.fromCharCode(65 + rowIdx)}
              </div>
              <div className="flex-1 flex justify-center gap-2">
                {Array.from({ length: config.seatsPerRow }).map((_, seatIdx) => {
                  const seatId = `${section}-${rowIdx}-${seatIdx}`
                  const isOccupied = occupiedSeats.has(seatId)
                  const isSelected = selectedSeats.includes(seatId)

                  return (
                    <button
                      key={seatIdx}
                      onClick={() => handleSeatClick(seatId)}
                      disabled={isOccupied}
                      className={cn(
                        'w-8 h-8 rounded-t-lg border-2 text-xs font-semibold transition-all',
                        isOccupied &&
                          'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-50',
                        !isOccupied &&
                          !isSelected &&
                          'bg-white border-gray-300 hover:border-blue-600 hover:bg-blue-50 cursor-pointer',
                        isSelected && 'bg-blue-600 border-blue-600 text-white scale-110',
                      )}
                      title={isOccupied ? '선택 불가' : `${seatIdx + 1}번`}
                    >
                      {seatIdx + 1}
                    </button>
                  )
                })}
              </div>
              <div className="w-8" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg border-2 border-gray-300 bg-white" />
          <span>선택 가능</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg border-2 border-blue-600 bg-blue-600" />
          <span>선택됨</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg border-2 border-gray-300 bg-gray-100 opacity-50" />
          <span>선택 불가</span>
        </div>
      </div>
    </Card>
  )
}
