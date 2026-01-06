export type PreRegisterStatus = 'REGISTERED' | 'CANCELED'

export interface PreRegister {
  id: number
  eventId: number
  userId: number
  status: PreRegisterStatus
  createdAt: string
  imageUrl: string
  eventTitle: string
  eventDate: string
  place: string
  ticketOpenAt: string
}
