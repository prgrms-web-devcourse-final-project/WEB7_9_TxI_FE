import { eventsApi } from '@/api/events'
import { ticketsApi } from '@/api/tickets'
import { QrCodeSection } from '@/components/QrCodeSection'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { formatDateTime } from '@/utils/format'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Calendar, CheckCircle, CreditCard, MapPin, Ticket as TicketIcon } from 'lucide-react'

interface MyTicketDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketId: string
}

export function MyTicketDetailModal({ open, onOpenChange, ticketId }: MyTicketDetailModalProps) {
  const { data } = useSuspenseQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketsApi.getMyTicketDetail(ticketId),
  })

  const { data: eventData } = useSuspenseQuery({
    queryKey: ['event', String(data.data.eventId)],
    queryFn: () => eventsApi.getEventById(String(data.data.eventId)),
  })

  const ticket = data.data
  const event = eventData.data

  const issuedDateTime = formatDateTime(ticket.issuedAt)
  const usedDateTime = ticket.usedAt ? formatDateTime(ticket.usedAt) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>티켓 정보</DialogTitle>
        </DialogHeader>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <TicketIcon className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">티켓 번호</p>
                  <p className="text-gray-600">#{ticket.ticketId}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">좌석 정보</p>
                  <p className="text-gray-600">
                    {ticket.seatGrade} - {ticket.seatCode}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">발급 일시</p>
                  <p className="text-gray-600">
                    {issuedDateTime.date} {issuedDateTime.time}
                  </p>
                </div>
              </div>
              {usedDateTime && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">사용 일시</p>
                    <p className="text-gray-600">
                      {usedDateTime.date} {usedDateTime.time}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">결제 금액</p>
                  <p className="text-gray-600">{ticket.seatPrice.toLocaleString()}원</p>
                </div>
              </div>
            </div>
          </Card>

          <Button className="w-full mb-3" size="lg" asChild>
            <Link to="/events/$id" params={{ id: String(ticket.eventId) }}>
              이벤트 상세보기
            </Link>
          </Button>

          {ticket.ticketStatus === 'ISSUED' && event && (
            <QrCodeSection ticketId={ticket.ticketId} eventDate={event.eventDate} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
