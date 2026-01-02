import type { Ticket } from '@/types/ticket'

export const getTicketStatusBadgeClass = (status: Ticket['ticketStatus']) => {
  const classMap: Record<Ticket['ticketStatus'], string> = {
    DRAFT: 'bg-gray-100 text-gray-700 border-gray-300 border-none',
    PAID: 'bg-yellow-100 text-yellow-700 border-yellow-300 border-none',
    ISSUED: 'bg-blue-100 text-blue-700 border-blue-300 border-none',
    USED: 'bg-green-100 text-green-700 border-green-300 border-none',
    FAILED: 'bg-red-100 text-red-700 border-red-300 border-none',
  }
  return classMap[status]
}
