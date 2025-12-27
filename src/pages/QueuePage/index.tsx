import type { ConfirmPaymentResponse, CreateOrderResponse } from '@/api/order'
import { orderApi } from '@/api/order'
import { queueApi } from '@/api/queue'
import { seatsApi } from '@/api/seats'
import { PaymentSuccessModal } from '@/components/PaymentSuccessModal'
import { useQueueWebSocket } from '@/hooks/useQueueWebSocket'
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PaymentStep } from './components/PaymentStep'
import { PurchaseStep } from './components/PurchaseStep'
import { QueueHeader } from './components/QueueHeader'
import { ReadyStep } from './components/ReadyStep'
import { WaitingStep } from './components/WaitingStep'
import { useQueueTimer } from './hooks/useQueueTimer'
import type { QueueStep } from './types'

export default function QueuePage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/events/$id/queue' })

  const { data: queueData } = useSuspenseQuery({
    queryKey: ['queueStatus', id],
    queryFn: () => queueApi.getQueueStatus(id),
  })

  const getInitialStep = (): QueueStep => {
    const status = queueData.data.status
    switch (status) {
      case 'WAITING':
        return 'waiting'
      case 'ENTERED':
        return 'ready'
      case 'EXPIRED':
        navigate({ to: '/events' })
        return 'waiting'
      case 'COMPLETED':
        navigate({ to: '/my-tickets' })
        return 'waiting'
      default:
        return 'waiting'
    }
  }

  const [step, setStep] = useState<QueueStep>(getInitialStep())

  const { data: seatsData } = useQuery({
    queryKey: ['seats', id],
    queryFn: () => seatsApi.getSeats(id),
    enabled: step === 'purchase' || step === 'payment',
  })
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [selectedSection, setSelectedSection] = useState<string>('VIP')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedRefund, setAgreedRefund] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderData, setOrderData] = useState<CreateOrderResponse | null>(null)
  const [paymentResult, setPaymentResult] = useState<ConfirmPaymentResponse | null>(null)

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

  const { minutes, seconds, start } = useQueueTimer(900, () => {
    navigate({ to: '/events' })
  })

  const createOrderMutation = useMutation({
    mutationFn: orderApi.createOrder,
  })

  const confirmPaymentMutation = useMutation({
    mutationFn: orderApi.confirmPayment,
  })

  useEffect(() => {
    const status = queueData.data.status

    if (status === 'WAITING' && step !== 'waiting' && step !== 'purchase' && step !== 'payment') {
      setStep('waiting')
    } else if (status === 'ENTERED' && step === 'waiting') {
      setStep('ready')
      start()
    } else if (status === 'EXPIRED') {
      navigate({ to: '/events' })
    } else if (status === 'COMPLETED') {
      navigate({ to: '/my-tickets' })
    }
  }, [queueData.data.status, step, navigate, start])

  useEffect(() => {
    if (personalEvent) {
      if ('enteredAt' in personalEvent) {
        setStep('ready')
        start()
      } else if ('expiredAt' in personalEvent) {
        navigate({ to: '/events' })
      } else if ('completedAt' in personalEvent) {
        navigate({ to: '/my-tickets' })
      }
      clearPersonalEvent()
    }
  }, [personalEvent, clearPersonalEvent, navigate, start])

  const handlePurchase = async () => {
    if (selectedSeats.length === 0) {
      toast.error('좌석을 선택해주세요')
      return
    }

    if (!seatsData?.data) {
      toast.error('좌석 정보를 불러오는 중입니다')
      return
    }

    const seatId = selectedSeats[0]
    const seat = seatsData.data.find((s) => s.id === seatId)
    if (!seat) {
      toast.error('좌석 정보를 찾을 수 없습니다')
      return
    }

    createOrderMutation.mutate(
      {
        amount: seat.price,
        eventId: Number(id),
        seatId: seatId,
      },
      {
        onSuccess: (response) => {
          setOrderData(response.data)
          setStep('payment')
        },
        onError: (error) => {
          toast.error(error.message)
        },
      },
    )
  }

  const handlePayment = async () => {
    if (!agreedTerms || !agreedRefund) {
      return
    }

    if (!orderData) {
      toast.error('주문 정보가 없습니다')
      return
    }

    setIsProcessing(true)

    confirmPaymentMutation.mutate(
      {
        orderId: orderData.orderId,
        amount: orderData.amount,
        paymentKey: `mock_payment_key_${orderData.orderKey}`,
      },
      {
        onSuccess: (response) => {
          setIsProcessing(false)
          setPaymentResult(response.data)
          setShowSuccessModal(true)
        },
        onError: (error) => {
          setIsProcessing(false)
          toast.error(error.message)
        },
      },
    )
  }

  const currentPosition = queuePosition ?? queueData.data.queueRank
  const currentEstimatedTime = estimatedWaitTime ?? queueData.data.estimatedWaitTime
  const currentProgress = progress ?? queueData.data.progress

  return (
    <div className="min-h-screen">
      <QueueHeader step={step} minutes={minutes} seconds={seconds} />

      <main className="container mx-auto px-4 py-12">
        {step === 'waiting' && (
          <WaitingStep
            queuePosition={currentPosition}
            estimatedWaitTime={currentEstimatedTime}
            progress={currentProgress}
            isConnected={isConnected}
            eventId={id}
            onProcessComplete={() => {
              setStep('ready')
              start()
            }}
          />
        )}

        {step === 'ready' && (
          <ReadyStep minutes={minutes} seconds={seconds} onEnter={() => setStep('purchase')} />
        )}

        {step === 'purchase' && (
          <PurchaseStep
            eventId={id}
            selectedSeats={selectedSeats}
            setSelectedSeats={setSelectedSeats}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            minutes={minutes}
            seconds={seconds}
            onProceed={handlePurchase}
          />
        )}

        {step === 'payment' && orderData && (
          <PaymentStep
            eventId={id}
            selectedSeats={selectedSeats}
            orderData={orderData}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            agreedTerms={agreedTerms}
            setAgreedTerms={setAgreedTerms}
            agreedRefund={agreedRefund}
            setAgreedRefund={setAgreedRefund}
            isProcessing={isProcessing}
            onPayment={handlePayment}
          />
        )}
      </main>

      {showSuccessModal && paymentResult && (
        <PaymentSuccessModal
          open={showSuccessModal}
          onOpenChange={setShowSuccessModal}
          paymentData={paymentResult}
        />
      )}
    </div>
  )
}
