import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { queueApi } from '@/api/queue'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Progress } from '@/components/ui/Progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Separator } from '@/components/ui/Separator'
import { PaymentSuccessModal } from '@/components/PaymentSuccessModal'
import { useQueueWebSocket } from '@/hooks/useQueueWebSocket'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Loader2,
  Lock,
  Shield,
  Smartphone,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const seatMap = {
  vip: { rows: 3, seatsPerRow: 8, label: 'VIP석', color: 'text-yellow-500' },
  r: { rows: 5, seatsPerRow: 12, label: 'R석', color: 'text-blue-500' },
  s: { rows: 6, seatsPerRow: 14, label: 'S석', color: 'text-green-500' },
  a: { rows: 8, seatsPerRow: 16, label: 'A석', color: 'text-purple-500' },
}

const occupiedSeats = new Set([
  'vip-1-3',
  'vip-2-4',
  'r-2-5',
  'r-3-6',
  'r-3-7',
  's-4-8',
  's-4-9',
  'a-5-10',
])

const seatPrices = {
  vip: 150000,
  r: 99000,
  s: 79000,
  a: 59000,
}

export default function QueuePage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/events/$id' })
  const [step, setStep] = useState<'waiting' | 'ready' | 'purchase' | 'payment'>('waiting')
  const [timeLeft, setTimeLeft] = useState(900)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [selectedSection, setSelectedSection] = useState<string>('r')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedRefund, setAgreedRefund] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const { data: queueData } = useSuspenseQuery({
    queryKey: ['queueStatus', id],
    queryFn: () => queueApi.getQueueStatus(id),
  })

  const {
    queuePosition,
    estimatedWaitTime,
    progress,
    personalEvent,
    isConnected,
    clearPersonalEvent,
  } = useQueueWebSocket({
    eventId: Number(id),
    enabled: true,
  })

  useEffect(() => {
    if (personalEvent) {
      if ('enteredAt' in personalEvent) {
        setStep('ready')
      } else if ('expiredAt' in personalEvent) {
        navigate({ to: '/events' })
      } else if ('completedAt' in personalEvent) {
        navigate({ to: '/my-tickets' })
      }
      clearPersonalEvent()
    }
  }, [personalEvent, clearPersonalEvent, navigate])

  useEffect(() => {
    if (step !== 'waiting') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            navigate({ to: '/events' })
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [step, navigate])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const currentPosition = queuePosition ?? queueData.data.queueRank
  const currentEstimatedTime = estimatedWaitTime ?? queueData.data.estimatedWaitTime
  const currentProgress = progress ?? queueData.data.progress

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

  const handlePurchase = () => {
    setStep('payment')
  }

  const handlePayment = async () => {
    if (!agreedTerms || !agreedRefund) {
      return
    }

    setIsProcessing(true)

    setTimeout(() => {
      setIsProcessing(false)
      setShowSuccessModal(true)
    }, 2000)
  }

  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const section = seatId.split('-')[0] as keyof typeof seatPrices
    return sum + seatPrices[section]
  }, 0)

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">WaitFair</span>
          </Link>
          {step !== 'waiting' ? (
            <Badge className="bg-red-100 text-red-800 animate-pulse">
              <Clock className="w-3 h-3 mr-1" />
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Badge>
          ) : (
            <Badge className="bg-blue-100 text-blue-600">대기 중</Badge>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {step === 'waiting' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-3xl font-bold mb-2">대기열에서 순서를 기다리는 중입니다</h1>
              <p className="text-gray-600">
                공정한 랜덤 큐 시스템으로 모두에게 동등한 기회를 제공합니다
              </p>
            </div>

            <Card className="p-6 mb-6 border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-red-600 mb-2">⏰ 구매 시간 제한 안내</div>
                  <p className="text-sm text-gray-600">
                    입장 준비가 완료된 시점부터{' '}
                    <span className="font-bold text-red-600">15분 이내</span>로 티켓팅을 완료하지
                    않으면 자동으로 다음 순번으로 넘어갑니다.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 mb-6">
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-blue-600 mb-2">
                  {currentPosition.toLocaleString()}
                </div>
                <div className="text-xl text-gray-600">현재 대기 순번</div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">전체 진행률</span>
                    <span className="text-sm font-semibold">{Math.round(currentProgress)}%</span>
                  </div>
                  <Progress
                    value={Math.round(currentProgress)}
                    className="h-2"
                    title="전체 진행률"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">예상 대기 시간</div>
                      <div className="text-xl font-bold">{currentEstimatedTime}분</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">앞 대기 인원</div>
                      <div className="text-xl font-bold">{currentPosition.toLocaleString()}명</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-blue-200 bg-blue-50">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                실시간 업데이트
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                  <div>
                    <div className="text-gray-600">10초마다 100명씩 입장 처리 중</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}
                  />
                  <div>
                    <div className="text-gray-600">
                      WebSocket {isConnected ? '연결됨' : '연결 중...'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                  <div>
                    <div className="text-gray-600">페이지를 새로고침하지 마세요</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {step === 'ready' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold mb-2">입장 준비가 완료되었습니다!</h1>
              <p className="text-gray-600">이제 티켓을 구매하실 수 있습니다</p>
            </div>

            <Card className="p-6 mb-6 border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-red-600 mb-2">⏰ 구매 시간 제한 안내</div>
                  <p className="text-sm text-gray-600">
                    현 시점부터{' '}
                    <span className="font-bold text-red-600">
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>{' '}
                    이내로 티켓팅을 완료하지 않으면 자동으로 다음 순번으로 넘어갑니다.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 mb-6 text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <p className="text-gray-600 mb-6">남은 시간 내에 구매를 완료해주세요</p>
              <Button size="lg" className="w-full" onClick={() => setStep('purchase')}>
                티켓 선택하기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            <Card className="p-6 border-blue-200 bg-blue-50">
              <h3 className="font-bold mb-4">주의사항</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>15분 내에 구매하지 않으면 자동으로 다음 순번으로 넘어갑니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>1인당 최대 1매까지 구매 가능합니다</span>
                </li>
              </ul>
            </Card>
          </div>
        )}

        {step === 'purchase' && (
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
                    {Object.entries(seatMap).map(([key, section]) => (
                      <Button
                        key={key}
                        variant={selectedSection === key ? 'default' : 'outline'}
                        onClick={() => setSelectedSection(key)}
                        className="flex-1"
                      >
                        {section.label}
                      </Button>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="mb-6">
                    <div className="bg-gradient-to-b from-blue-100 to-transparent py-3 text-center rounded-lg border border-blue-300 mb-8">
                      <div className="text-sm font-semibold">무대</div>
                    </div>

                    <div className="space-y-3">
                      {Array.from({
                        length: seatMap[selectedSection as keyof typeof seatMap].rows,
                      }).map((_, rowIdx) => (
                        <div key={rowIdx} className="flex items-center gap-2">
                          <div className="w-8 text-sm text-gray-600 text-center">
                            {String.fromCharCode(65 + rowIdx)}
                          </div>
                          <div className="flex-1 flex justify-center gap-2">
                            {Array.from({
                              length: seatMap[selectedSection as keyof typeof seatMap].seatsPerRow,
                            }).map((_, seatIdx) => {
                              const seatId = `${selectedSection}-${rowIdx}-${seatIdx}`
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
                                    isSelected &&
                                      'bg-blue-600 border-blue-600 text-white scale-110',
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
                            const [section, row, seat] = seatId.split('-')
                            const sectionLabel = seatMap[section as keyof typeof seatMap].label
                            const rowLabel = String.fromCharCode(65 + Number.parseInt(row))
                            const seatNumber = Number.parseInt(seat) + 1
                            const price = seatPrices[section as keyof typeof seatPrices]

                            return (
                              <div
                                key={seatId}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="font-semibold">
                                  {sectionLabel} {rowLabel}열 {seatNumber}번
                                </span>
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
                    onClick={handlePurchase}
                    disabled={selectedSeats.length === 0}
                  >
                    {selectedSeats.length === 0 ? '좌석을 선택해주세요' : '결제하기'}
                    {selectedSeats.length > 0 && <ChevronRight className="w-4 h-4 ml-1" />}
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">결제</h1>
              <p className="text-gray-600">안전한 결제 시스템으로 보호됩니다</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-bold">결제 수단</h2>
                  </div>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    <label className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all border-blue-600 bg-blue-50">
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <Label htmlFor="card" className="font-semibold cursor-pointer">
                          신용/체크카드
                        </Label>
                        <div className="text-sm text-gray-600">국내 모든 카드 사용 가능</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all border-gray-300 hover:border-blue-300 hover:bg-gray-50">
                      <RadioGroupItem value="mobile" id="mobile" />
                      <Smartphone className="w-5 h-5" />
                      <div className="flex-1">
                        <Label htmlFor="mobile" className="font-semibold cursor-pointer">
                          휴대폰 결제
                        </Label>
                        <div className="text-sm text-gray-600">통신사 소액결제</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all border-gray-300 hover:border-blue-300 hover:bg-gray-50">
                      <RadioGroupItem value="bank" id="bank" />
                      <Building2 className="w-5 h-5" />
                      <div className="flex-1">
                        <Label htmlFor="bank" className="font-semibold cursor-pointer">
                          계좌이체
                        </Label>
                        <div className="text-sm text-gray-600">실시간 계좌이체</div>
                      </div>
                    </label>
                  </RadioGroup>
                </Card>

                {paymentMethod === 'card' && (
                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">카드 정보</h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">카드번호</Label>
                        <Input
                          id="cardNumber"
                          placeholder="0000-0000-0000-0000"
                          className="mt-1.5"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">유효기간</Label>
                          <Input id="expiry" placeholder="MM/YY" className="mt-1.5" />
                        </div>
                        <div>
                          <Label htmlFor="cvc">CVC</Label>
                          <Input
                            id="cvc"
                            placeholder="123"
                            type="password"
                            maxLength={3}
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardPassword">카드 비밀번호</Label>
                        <Input
                          id="cardPassword"
                          placeholder="앞 2자리"
                          type="password"
                          maxLength={2}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                  </Card>
                )}

                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">구매자 정보</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">이름</Label>
                      <Input
                        id="name"
                        placeholder="홍길동"
                        defaultValue="홍길동"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">휴대폰 번호</Label>
                      <Input
                        id="phone"
                        placeholder="010-0000-0000"
                        defaultValue="010-1234-5678"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">이메일</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        defaultValue="test@waitfair.com"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">약관 동의</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={agreedTerms}
                        onCheckedChange={(checked) => setAgreedTerms(!!checked)}
                      />
                      <div className="flex-1">
                        <Label htmlFor="terms" className="font-semibold cursor-pointer">
                          구매 조건 및 결제 대행 서비스 약관 동의 (필수)
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          전자금융거래법에 의거하여 결제 대행 서비스 이용약관에 동의합니다
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="refund"
                        checked={agreedRefund}
                        onCheckedChange={(checked) => setAgreedRefund(!!checked)}
                      />
                      <div className="flex-1">
                        <Label htmlFor="refund" className="font-semibold cursor-pointer">
                          취소 및 환불 규정 동의 (필수)
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          이벤트 7일 전까지 전액 환불, 3일 전까지 50% 환불 가능
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
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
                        {selectedSeats.map((seatId) => {
                          const [section, row, seat] = seatId.split('-')
                          const sectionLabel = seatMap[section as keyof typeof seatMap].label
                          const rowLabel = String.fromCharCode(65 + Number.parseInt(row))
                          const seatNumber = Number.parseInt(seat) + 1

                          return (
                            <div key={seatId} className="text-sm font-medium">
                              {sectionLabel} {rowLabel}열 {seatNumber}번
                            </div>
                          )
                        })}
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
                    disabled={isProcessing}
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
        )}
      </main>

      <PaymentSuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        selectedSeats={selectedSeats}
      />
    </div>
  )
}
