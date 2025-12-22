import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { SeatMap } from '@/components/SeatMap'
import { seatMap, seatPrices } from '@/components/SeatMap/constants'
import type { SeatSection } from '@/components/SeatMap/types'
import { formatSeatLabel } from '@/utils/seatFormatter'
import { calculateTotalPrice } from '@/utils/priceCalculator'
import { AlertCircle, ChevronRight, Users } from 'lucide-react'
import { occupiedSeats } from '../constants'
import type { PurchaseStepProps } from '../types'

export function PurchaseStep({
  selectedSeats,
  setSelectedSeats,
  selectedSection,
  setSelectedSection,
  minutes,
  seconds,
  onProceed,
}: PurchaseStepProps) {
  const handleSeatClick = (seatId: string) => {
    if (occupiedSeats.has(seatId)) return

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId)
      } else if (prev.length < 1) {
        return [...prev, seatId]
      }
      return prev
    })
  }

  const totalPrice = calculateTotalPrice(selectedSeats)

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
            <div className="flex gap-2">
              {(Object.entries(seatMap) as [SeatSection, typeof seatMap[SeatSection]][]).map(
                ([key, section]) => (
                  <Button
                    key={key}
                    variant={selectedSection === key ? 'default' : 'outline'}
                    onClick={() => setSelectedSection(key)}
                    className="flex-1"
                  >
                    {section.label}
                  </Button>
                ),
              )}
            </div>
          </Card>

          <SeatMap
            section={selectedSection}
            selectedSeats={selectedSeats}
            occupiedSeats={occupiedSeats}
            onSeatClick={handleSeatClick}
            maxSeats={1}
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
                      const section = seatId.split('-')[0] as SeatSection
                      const price = seatPrices[section]

                      return (
                        <div
                          key={seatId}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="font-semibold">{formatSeatLabel(seatId)}</span>
                          <span className="text-gray-600">{price.toLocaleString()}원</span>
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
