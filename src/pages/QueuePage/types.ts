import type { SeatSection } from '@/components/SeatMap/types'

export type QueueStep = 'waiting' | 'ready' | 'purchase' | 'payment'

export interface QueueHeaderProps {
  step: QueueStep
  minutes: number
  seconds: number
}

export interface WaitingStepProps {
  queuePosition: number
  estimatedWaitTime: number
  progress: number
  isConnected: boolean
}

export interface ReadyStepProps {
  minutes: number
  seconds: number
  onEnter: () => void
}

export interface PurchaseStepProps {
  selectedSeats: string[]
  setSelectedSeats: (seats: string[]) => void
  selectedSection: SeatSection
  setSelectedSection: (section: SeatSection) => void
  minutes: number
  seconds: number
  onProceed: () => void
}

export interface PaymentStepProps {
  selectedSeats: string[]
  paymentMethod: string
  setPaymentMethod: (method: string) => void
  agreedTerms: boolean
  setAgreedTerms: (agreed: boolean) => void
  agreedRefund: boolean
  setAgreedRefund: (agreed: boolean) => void
  isProcessing: boolean
  onPayment: () => void
}
