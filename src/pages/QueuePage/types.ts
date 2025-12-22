import type { SeatSection } from '@/components/SeatMap/types'
import type { Dispatch, SetStateAction } from 'react'

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
  eventId: string
  onProcessComplete: () => void
}

export interface ReadyStepProps {
  minutes: number
  seconds: number
  onEnter: () => void
}

export interface PurchaseStepProps {
  eventId: string
  selectedSeats: string[]
  setSelectedSeats: Dispatch<SetStateAction<string[]>>
  selectedSection: SeatSection
  setSelectedSection: Dispatch<SetStateAction<SeatSection>>
  minutes: number
  seconds: number
  onProceed: () => void
}

export interface PaymentStepProps {
  selectedSeats: string[]
  paymentMethod: string
  setPaymentMethod: Dispatch<SetStateAction<string>>
  agreedTerms: boolean
  setAgreedTerms: Dispatch<SetStateAction<boolean>>
  agreedRefund: boolean
  setAgreedRefund: Dispatch<SetStateAction<boolean>>
  isProcessing: boolean
  onPayment: () => void
}
