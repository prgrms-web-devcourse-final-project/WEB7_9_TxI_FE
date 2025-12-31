import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { orderApi } from '@/api/order'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { V2_PaymentConfirmResponse } from '@/types/order'

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as {
    paymentKey?: string
    orderId?: string
    amount?: string
  }

  const { paymentKey, orderId, amount } = search

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<V2_PaymentConfirmResponse | null>(null)

  // 중복 호출 방지
  const hasCalledRef = useRef(false)

  useEffect(() => {
    // 이미 호출했으면 스킵
    if (hasCalledRef.current) {
      console.log('[PaymentSuccessPage] 이미 결제 확인 API 호출됨 - 스킵')
      return
    }

    const confirmPayment = async () => {
      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 올바르지 않습니다')
        setIsLoading(false)
        return
      }

      // 호출 플래그 설정
      hasCalledRef.current = true
      console.log('[PaymentSuccessPage] 결제 확인 API 호출 시작')

      try {
        const response = await orderApi.confirmTossPayment({
          orderId: orderId,  // UUID 문자열 그대로 전송
          paymentKey,
          amount: Number(amount),
        })

        console.log('[PaymentSuccessPage] 결제 확인 성공')
        setPaymentData(response.data)
        setIsLoading(false)
      } catch (err: any) {
        console.error('[PaymentSuccessPage] 결제 확인 실패:', err)
        setError(err.message || '결제 확인 중 오류가 발생했습니다')
        setIsLoading(false)
      }
    }

    confirmPayment()
  }, [paymentKey, orderId, amount])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold mb-2">결제를 처리하고 있습니다</h2>
            <p className="text-gray-600">잠시만 기다려주세요...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">결제 처리 실패</h2>
            <p className="text-gray-600">{error}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2 text-sm">전달된 파라미터</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>주문 ID:</span>
                <span className="font-mono">{orderId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>결제 키:</span>
                <span className="font-mono truncate ml-2" style={{ maxWidth: '200px' }}>
                  {paymentKey || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>금액:</span>
                <span>{amount ? Number(amount).toLocaleString() + '원' : 'N/A'}</span>
              </div>
            </div>
          </div>

          <Button onClick={() => navigate({ to: '/events' })} className="w-full" variant="outline">
            이벤트 목록으로
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">결제가 완료되었습니다!</h2>
          <p className="text-gray-600">티켓이 성공적으로 발급되었습니다</p>
        </div>

        {paymentData && (
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-sm text-blue-900">결제 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">주문 ID:</span>
                  <span className="font-mono text-xs truncate ml-2" style={{ maxWidth: '200px' }}>
                    {paymentData.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결제 금액:</span>
                  <span className="font-semibold text-blue-600">
                    {paymentData.amount.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결제 방법:</span>
                  <span className="font-semibold">{paymentData.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결제 시간:</span>
                  <span className="font-semibold">
                    {new Date(paymentData.paidAt).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-sm">티켓 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">티켓 ID:</span>
                  <span className="font-semibold">{paymentData.ticketId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">이벤트:</span>
                  <span className="font-semibold">{paymentData.eventTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">좌석:</span>
                  <span className="font-semibold">
                    {paymentData.seatGrade} - {paymentData.seatCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">장소:</span>
                  <span className="font-semibold">{paymentData.eventPlace}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">일시:</span>
                  <span className="font-semibold">
                    {new Date(paymentData.eventDate).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button onClick={() => navigate({ to: '/my-tickets' })} className="w-full">
            내 티켓 보기
          </Button>
          <Button
            onClick={() => navigate({ to: '/events' })}
            className="w-full"
            variant="outline"
          >
            이벤트 목록으로
          </Button>
        </div>
      </Card>
    </div>
  )
}
