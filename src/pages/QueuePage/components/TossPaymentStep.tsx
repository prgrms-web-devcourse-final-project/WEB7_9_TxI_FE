import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { useTossPayments } from '@/hooks/useTossPayments'
import { seatsApi } from '@/api/seats'
import { useSuspenseQuery } from '@tanstack/react-query'
import { CheckCircle2, Lock, AlertCircle } from 'lucide-react'
import type { PrepareOrderResponse } from '@/types/order'

interface TossPaymentStepProps {
  eventId: string
  eventTitle: string
  selectedSeats: number[]
  orderData: PrepareOrderResponse
  onPaymentStart?: () => void  // 결제 시작 콜백
}

export function TossPaymentStep({
  eventId,
  eventTitle,
  selectedSeats,
  orderData,
  onPaymentStart,
}: TossPaymentStepProps) {
  const paymentWidgetRef = useRef<HTMLDivElement>(null)
  const hasRendered = useRef(false)

  const { data: seatsData } = useSuspenseQuery({
    queryKey: ['seats', eventId],
    queryFn: () => seatsApi.getSeats(eventId),
  })

  const seats = seatsData.data

  const { isReady, error, renderPaymentMethods, requestPayment } = useTossPayments({
    amount: orderData.amount,
    orderId: orderData.orderId,
    orderName: orderData.orderName,
  })

  useEffect(() => {
    if (isReady && paymentWidgetRef.current && !hasRendered.current) {
      renderPaymentMethods('#payment-widget')
        .then(() => {
          hasRendered.current = true
        })
        .catch((err) => {
          console.error('결제 위젯 렌더링 실패:', err)
        })
    }
  }, [isReady, renderPaymentMethods])

  const handlePayment = async () => {
    try {
      // 결제 시작 알림
      onPaymentStart?.()

      const userEmail = localStorage.getItem('userEmail') || ''

      await requestPayment({
        successUrl: `${window.location.origin}/payment-success`,
        failUrl: window.location.href,
        customerEmail: userEmail,
        customerName: '사용자',
      })
    } catch (err: any) {
      console.error('결제 요청 실패:', err)
    }
  }

  const totalPrice = orderData.amount

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">결제</h1>
        <p className="text-gray-600">토스페이먼츠 안전 결제 시스템으로 보호됩니다</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-600 mb-1">결제 위젯 오류</div>
                  <div className="text-sm text-gray-600">{error}</div>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">결제 수단 선택</h2>

            <div id="payment-widget" ref={paymentWidgetRef} className="min-h-[300px]">
              {!isReady && !error && (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>결제 위젯을 불러오는 중...</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">결제 정보</h2>

            <div className="space-y-4 mb-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">이벤트</div>
                <div className="font-semibold">{eventTitle}</div>
              </div>
              <Separator />

              <div>
                <div className="text-sm text-gray-600 mb-2">선택한 좌석</div>
                <div className="space-y-1">
                  {selectedSeats.map((seatId) => {
                    const seat = seats.find((s) => s.id === seatId)
                    if (!seat) return null
                    return (
                      <div key={seatId} className="text-sm font-medium">
                        {seat.grade} - {seat.seatCode}
                      </div>
                    )
                  })}
                </div>
              </div>

              <Separator />
              <div>
                <div className="text-sm text-gray-600 mb-1">주문 정보</div>
                <div className="text-xs bg-gray-50 p-2 rounded">
                  <div>주문 ID: {orderData.orderId}</div>
                  <div>주문명: {orderData.orderName}</div>
                </div>
              </div>

              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">티켓 금액</span>
                <span className="font-semibold">{totalPrice.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">예매 수수료</span>
                <span className="font-semibold text-blue-600">무료</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-bold">최종 결제 금액</span>
                <span className="font-bold text-blue-600 text-2xl">
                  {totalPrice.toLocaleString()}원
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full mb-4"
              onClick={handlePayment}
              disabled={!isReady || !!error}
            >
              {!isReady ? (
                <>결제 위젯 로딩 중...</>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  {totalPrice.toLocaleString()}원 결제하기
                </>
              )}
            </Button>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>토스페이먼츠 안전 결제 시스템</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>개인정보는 암호화되어 안전하게 보호됩니다</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>결제 완료 후 즉시 티켓이 발급됩니다</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
