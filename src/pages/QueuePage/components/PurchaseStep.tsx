import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { SeatMap } from '@/components/SeatMap'
import { seatsApi } from '@/api/seats'
import { useSeatWebSocket, applySeatChanges } from '@/hooks/useSeatWebSocket'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { AlertCircle, ChevronRight, Users } from 'lucide-react'
import { toast } from 'sonner'
import type { PurchaseStepProps } from '../types'

export function PurchaseStep({
  eventId,
  selectedSeats,
  setSelectedSeats,
  selectedSection,
  setSelectedSection,
  minutes,
  seconds,
  onProceed,
}: PurchaseStepProps) {
  const { data: seatsData } = useSuspenseQuery({
    queryKey: ['seats', eventId],
    queryFn: () => seatsApi.getSeats(eventId),
  })

  const { seatChanges } = useSeatWebSocket({
    eventId: Number(eventId),
    enabled: true,
  })

  const seats = seatsData.data
  const updatedSeats = applySeatChanges(seats, seatChanges)

  const grades = Array.from(new Set(updatedSeats.map((seat) => seat.grade)))

  const selectSeatMutation = useMutation({
    mutationFn: ({ seatId }: { seatId: string }) => seatsApi.selectSeat(eventId, seatId),
  })

  const deselectSeatMutation = useMutation({
    mutationFn: ({ seatId }: { seatId: string }) => seatsApi.deselectSeat(eventId, seatId),
  })

  const handleSeatClick = (seatId: number) => {
    const seat = updatedSeats.find((s) => s.id === seatId)
    if (!seat || seat.seatStatus !== 'AVAILABLE') return

    const isSelected = selectedSeats.includes(seatId)

    if (isSelected) {
      deselectSeatMutation.mutate(
        { seatId: String(seatId) },
        {
          onSuccess: () => {
            setSelectedSeats((prev: number[]) => prev.filter((id) => id !== seatId))
          },
          onError: (error) => {
            toast.error(error.message)
          },
        },
      )
    } else {
      if (selectedSeats.length >= 1) {
        const previousSeatId = selectedSeats[0]
        deselectSeatMutation.mutate(
          { seatId: String(previousSeatId) },
          {
            onSuccess: () => {
              setSelectedSeats([])

              selectSeatMutation.mutate(
                { seatId: String(seatId) },
                {
                  onSuccess: () => {
                    setSelectedSeats([seatId])
                  },
                  onError: (error) => {
                    toast.error(error.message)
                  },
                },
              )
            },
            onError: (error) => {
              toast.error(error.message)
            },
          },
        )
        return
      }

      selectSeatMutation.mutate(
        { seatId: String(seatId) },
        {
          onSuccess: () => {
            setSelectedSeats([seatId])
          },
          onError: (error) => {
            toast.error(error.message)
          },
        },
      )
    }
  }

  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const seat = updatedSeats.find((s) => s.id === seatId)
    return sum + (seat?.price || 0)
  }, 0)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">좌석 선택</h1>
        <p className="text-gray-600">2025 서울 뮤직 페스티벌</p>
      </div>

      <Card className="p-6 mb-6 bg-red-50 border-red-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-600 mb-1">구매 시간 제한</div>
            <div className="text-sm text-gray-600">
              {minutes}분 {seconds}초 후 자동으로 다음 순번으로 넘어갑니다. 15분 이내에 결제를
              완료해주세요.
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold">구역 선택</h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              {grades.map((grade) => (
                <Button
                  key={grade}
                  variant={selectedSection === grade ? 'default' : 'outline'}
                  onClick={() => setSelectedSection(grade)}
                  className="flex-1"
                >
                  {grade}
                </Button>
              ))}
            </div>
          </Card>

          <SeatMap
            seats={updatedSeats}
            selectedGrade={selectedSection}
            selectedSeatIds={selectedSeats}
            onSeatClick={handleSeatClick}
          />
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">선택 정보</h2>

            <div className="space-y-4 mb-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">이벤트</div>
                <div className="font-semibold">2025 서울 뮤직 페스티벌</div>
              </div>
              <Separator />

              <div>
                <div className="text-sm text-gray-600 mb-2">선택한 좌석</div>
                {selectedSeats.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSeats.map((seatId) => {
                      const seat = updatedSeats.find((s) => s.id === seatId)
                      if (!seat) return null

                      return (
                        <div key={seatId} className="flex items-center justify-between text-sm">
                          <span className="font-semibold">
                            {seat.grade} - {seat.seatCode}
                          </span>
                          <span className="text-gray-600">{seat.price.toLocaleString()}원</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">좌석을 선택해주세요 (최대 1석)</div>
                )}
              </div>

              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">선택한 매수</span>
                <span className="font-semibold">{selectedSeats.length}매</span>
              </div>

              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">티켓 금액</span>
                  <span>{totalPrice.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">수수료</span>
                  <span>0원</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>총 결제 금액</span>
                  <span className="text-blue-600">{totalPrice.toLocaleString()}원</span>
                </div>
              </div>

              <Separator />
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold mb-3 text-sm">좌석 선택 안내</h3>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                    <span>1인 1매만 선택 가능합니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                    <span>선택한 좌석은 5분간 임시 예약됩니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                    <span>결제 완료 후 Dynamic QR 티켓이 발급됩니다</span>
                  </li>
                </ul>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={onProceed}
              disabled={selectedSeats.length === 0}
            >
              {selectedSeats.length === 0 ? '좌석을 선택해주세요' : '결제하기'}
              {selectedSeats.length > 0 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
