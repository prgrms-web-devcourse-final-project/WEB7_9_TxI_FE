import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { applySeatChanges, useSeatWebSocket } from '@/hooks/useSeatWebSocket'
import type { Seat } from '@/types/seat'
import { Check, WifiOff, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SeatSelectionProps {
  eventId: number
  initialSeats: Seat[]
  onSeatSelect?: (seat: Seat) => void
  selectedSeatId?: number | null
}

export function SeatSelection({
  eventId,
  initialSeats,
  onSeatSelect,
  selectedSeatId,
}: SeatSelectionProps) {
  const [seats, setSeats] = useState<Seat[]>(initialSeats)
  const { seatChanges, isConnected } = useSeatWebSocket({ eventId })

  useEffect(() => {
    if (seatChanges.length > 0) {
      setSeats((currentSeats) => applySeatChanges(currentSeats, seatChanges))
    }
  }, [seatChanges])

  useEffect(() => {
    setSeats(initialSeats)
  }, [initialSeats])

  const getSeatStatusColor = (seat: Seat) => {
    if (seat.id === selectedSeatId) {
      return 'bg-blue-600 text-white border-blue-600'
    }

    switch (seat.seatStatus) {
      case 'AVAILABLE':
        return 'bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-400 cursor-pointer'
      case 'RESERVED':
        return 'bg-yellow-100 border-yellow-400 cursor-not-allowed'
      case 'SOLD':
        return 'bg-gray-300 border-gray-400 cursor-not-allowed'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  const getSeatIcon = (seat: Seat) => {
    if (seat.id === selectedSeatId) {
      return <Check className="w-4 h-4" />
    }
    if (seat.seatStatus === 'SOLD') {
      return <X className="w-4 h-4" />
    }
    return null
  }

  const handleSeatClick = (seat: Seat) => {
    if (seat.seatStatus !== 'AVAILABLE') return
    onSeatSelect?.(seat)
  }

  const seatsByGrade = seats.reduce(
    (acc, seat) => {
      if (!acc[seat.grade]) {
        acc[seat.grade] = []
      }
      acc[seat.grade].push(seat)
      return acc
    },
    {} as Record<string, Seat[]>,
  )

  return (
    <div className="space-y-6">
      {!isConnected && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-2 text-amber-800">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm">실시간 좌석 상태 연결 중...</span>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">좌석 상태</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded" />
            <span className="text-gray-600">선택 가능</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-400 rounded" />
            <span className="text-gray-600">예약 중</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-300 border-2 border-gray-400 rounded" />
            <span className="text-gray-600">판매 완료</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 border-2 border-blue-600 rounded" />
            <span className="text-gray-600">선택됨</span>
          </div>
        </div>
      </Card>

      {Object.entries(seatsByGrade).map(([grade, gradeSeats]) => (
        <Card key={grade} className="p-6">
          <h3 className="text-lg font-semibold mb-4">{grade} 구역</h3>
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
            {gradeSeats.map((seat) => (
              <Button
                key={seat.id}
                variant="outline"
                size="sm"
                className={`relative h-10 text-xs transition-all ${getSeatStatusColor(seat)}`}
                onClick={() => handleSeatClick(seat)}
                disabled={seat.seatStatus !== 'AVAILABLE'}
              >
                <span className="absolute inset-0 flex items-center justify-center">
                  {getSeatIcon(seat) || seat.seatCode}
                </span>
              </Button>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            가격: {gradeSeats[0]?.price.toLocaleString()}원
          </div>
        </Card>
      ))}

      {seatChanges.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 text-blue-800 text-sm">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span>실시간으로 {seatChanges.length}개의 좌석 상태가 업데이트되었습니다.</span>
          </div>
        </Card>
      )}
    </div>
  )
}
