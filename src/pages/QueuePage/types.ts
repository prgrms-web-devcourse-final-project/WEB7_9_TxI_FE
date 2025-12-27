import type { Dispatch, SetStateAction } from 'react'
import type { CreateOrderResponse } from '@/api/order'

export type QueueStep = 'waiting' | 'ready' | 'purchase' | 'payment'

export interface QueueHeaderProps {
  step: QueueStep
  minutes: number
  seconds: number
}

export interface WaitingStepProps {
  queuePosition: number
  waitingAhead: number | null
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
  selectedSeats: number[]
  setSelectedSeats: Dispatch<SetStateAction<number[]>>
  selectedSection: string
  setSelectedSection: Dispatch<SetStateAction<string>>
  minutes: number
  seconds: number
  onProceed: () => void
}

export interface PaymentStepProps {
  eventId: string
  selectedSeats: number[]
  orderData: CreateOrderResponse
  paymentMethod: string
  setPaymentMethod: Dispatch<SetStateAction<string>>
  agreedTerms: boolean
  setAgreedTerms: Dispatch<SetStateAction<boolean>>
  agreedRefund: boolean
  setAgreedRefund: Dispatch<SetStateAction<boolean>>
  isProcessing: boolean
  onPayment: () => Promise<void>
}
