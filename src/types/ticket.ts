export type SeatStatus = 'SOLD' | 'RESERVED' | 'AVAILABLE'
export type TicketStatus = 'DRAFT' | 'PAID' | 'ISSUED' | 'USED' | 'FAILED'

export interface Ticket {
  ticketId: number
  eventId: number
  eventTitle: string
  seatCode: string
  seatGrade: string
  seatPrice: number
  seatStatus: SeatStatus
  ticketStatus: TicketStatus
  issuedAt: string
  usedAt: string | null
}

export interface QrTokenResponse {
  qrToken: string
  expirationSecond: number
  refreshIntervalSecond: number
  qrUrl: string
}

export interface QrValidationResponse {
  isValid: boolean
  message: string
  ticketId: number
  eventId: number
  eventTitle: string
  seatCode: string | null
  ownerNickname: string
  eventDate: string
  qrIssuedAt: string
}
