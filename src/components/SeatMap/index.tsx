import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { SeatMapProps } from './types'

export function SeatMap({
  seats,
  selectedGrade,
  selectedSeatIds,
  onSeatClick,
}: SeatMapProps) {
  const gradeSeats = seats.filter((seat) => seat.grade === selectedGrade)

  const parseSeatCode = (seatCode: string) => {
    const match = seatCode.match(/^([A-Z]+)(\d+)$/)
    if (!match) return { row: '', number: 0 }
    return { row: match[1], number: parseInt(match[2], 10) }
  }

  const seatsByRow = gradeSeats.reduce(
    (acc, seat) => {
      const { row } = parseSeatCode(seat.seatCode)
      if (!acc[row]) acc[row] = []
      acc[row].push(seat)
      return acc
    },
    {} as Record<string, typeof gradeSeats>,
  )

  const sortedRows = Object.keys(seatsByRow).sort()

  sortedRows.forEach((row) => {
    seatsByRow[row].sort((a, b) => {
      const aNum = parseSeatCode(a.seatCode).number
      const bNum = parseSeatCode(b.seatCode).number
      return aNum - bNum
    })
  })

  const handleSeatClick = (seatId: number, seatStatus: string, isSelected: boolean) => {
    // 선택된 좌석은 해제 가능, 그 외에는 AVAILABLE만 선택 가능
    if (!isSelected && seatStatus !== 'AVAILABLE') return

    onSeatClick(seatId)
  }

  if (gradeSeats.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-12 text-gray-600">좌석 정보가 없습니다</div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="bg-gradient-to-b from-blue-100 to-transparent py-3 text-center rounded-lg border border-blue-300 mb-8">
          <div className="text-sm font-semibold">무대</div>
        </div>

        <div className="space-y-3">
          {sortedRows.map((row) => (
            <div key={row} className="flex items-center gap-2">
              <div className="w-8 text-sm text-gray-600 text-center">{row}</div>
              <div className="flex-1 flex justify-center gap-2">
                {seatsByRow[row].map((seat) => {
                  const { number } = parseSeatCode(seat.seatCode)
                  const isSelected = selectedSeatIds.includes(seat.id)
                  const isOccupied = seat.seatStatus !== 'AVAILABLE' && !isSelected

                  return (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id, seat.seatStatus, isSelected)}
                      disabled={isOccupied}
                      className={cn(
                        'w-8 h-8 rounded-t-lg border-2 text-xs font-semibold transition-all',
                        isOccupied &&
                          'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-50',
                        !isOccupied &&
                          !isSelected &&
                          'bg-white border-gray-300 hover:border-blue-600 hover:bg-blue-50 cursor-pointer',
                        isSelected && 'bg-blue-600 border-blue-600 text-white scale-110 cursor-pointer',
                      )}
                      title={isSelected ? `${number}번 (클릭하여 해제)` : isOccupied ? '선택 불가' : `${number}번`}
                    >
                      {number}
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
