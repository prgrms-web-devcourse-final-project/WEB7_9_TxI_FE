import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { PaymentMethods } from '@/components/PaymentForm/PaymentMethods'
import { CardInfoForm } from '@/components/PaymentForm/CardInfoForm'
import { BuyerInfoForm } from '@/components/PaymentForm/BuyerInfoForm'
import { TermsAgreement } from '@/components/TermsAgreement'
import { seatMap } from '@/components/SeatMap/constants'
import type { SeatSection } from '@/components/SeatMap/types'
import { formatSeatLabel } from '@/utils/seatFormatter'
import { calculateTotalPrice } from '@/utils/priceCalculator'
import { CheckCircle2, Lock } from 'lucide-react'
import type { PaymentStepProps } from '../types'

export function PaymentStep({
  selectedSeats,
  paymentMethod,
  setPaymentMethod,
  agreedTerms,
  setAgreedTerms,
  agreedRefund,
  setAgreedRefund,
  isProcessing,
  onPayment,
}: PaymentStepProps) {
  const totalPrice = calculateTotalPrice(selectedSeats)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">결제</h1>
        <p className="text-gray-600">안전한 결제 시스템으로 보호됩니다</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PaymentMethods value={paymentMethod} onValueChange={setPaymentMethod} />

          {paymentMethod === 'card' && <CardInfoForm />}

          <BuyerInfoForm />

          <TermsAgreement
            agreedTerms={agreedTerms}
            setAgreedTerms={setAgreedTerms}
            agreedRefund={agreedRefund}
            setAgreedRefund={setAgreedRefund}
          />
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">결제 정보</h2>

            <div className="space-y-4 mb-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">이벤트</div>
                <div className="font-semibold">2025 서울 뮤직 페스티벌</div>
              </div>
              <Separator />

              <div>
                <div className="text-sm text-gray-600 mb-2">선택한 좌석</div>
                <div className="space-y-1">
                  {selectedSeats.map((seatId) => (
                    <div key={seatId} className="text-sm font-medium">
                      {formatSeatLabel(seatId)}
                    </div>
                  ))}
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
              onClick={onPayment}
              disabled={isProcessing || !agreedTerms || !agreedRefund}
            >
              {isProcessing ? (
                <>처리 중...</>
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
