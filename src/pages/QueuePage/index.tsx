import { useEffect, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { queueApi } from '@/api/queue'
import { PaymentSuccessModal } from '@/components/PaymentSuccessModal'
import { useQueueWebSocket } from '@/hooks/useQueueWebSocket'
import type { SeatSection } from '@/components/SeatMap/types'
import { QueueHeader } from './components/QueueHeader'
import { WaitingStep } from './components/WaitingStep'
import { ReadyStep } from './components/ReadyStep'
import { PurchaseStep } from './components/PurchaseStep'
import { PaymentStep } from './components/PaymentStep'
import { useQueueTimer } from './hooks/useQueueTimer'
import type { QueueStep } from './types'

export default function QueuePage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/events/$id/queue' })

  const { data: queueData } = useSuspenseQuery({
    queryKey: ['queueStatus', id],
    queryFn: () => queueApi.getQueueStatus(id),
  })

  // API 응답의 status에 따라 초기 step 설정
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
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [selectedSection, setSelectedSection] = useState<SeatSection>('r')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedRefund, setAgreedRefund] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

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

  // API 응답의 status가 변경되면 step 업데이트
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

  // WebSocket 이벤트 처리
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

        {step === 'payment' && (
          <PaymentStep
            selectedSeats={selectedSeats}
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

      <PaymentSuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        selectedSeats={selectedSeats}
      />
    </div>
  )
}
