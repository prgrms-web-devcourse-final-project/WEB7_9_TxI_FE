import { preRegisterApi } from '@/api/preRegister'
import { ticketsApi } from '@/api/tickets'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { MyTicketDetailModal } from '@/components/MyTicketDetailModal'
import { TransferTicketModal } from '@/components/TransferTicketModal'
import { formatDateTime } from '@/utils/format'
import { getTicketStatusBadgeClass } from '@/utils/getTicketStatusBadgeClass'
import { getTicketStatusText } from '@/utils/getTicketStatusText'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ArrowRight,
  Calendar,
  Check,
  MapPin,
  Ticket as TicketIcon,
  BadgeDollarSignIcon,
  Send,
} from 'lucide-react'

export default function MyTicketsPage() {
  const navigate = useNavigate()
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [transferTicket, setTransferTicket] = useState<{
    ticketId: number
    eventTitle: string
  } | null>(null)

  const { data: preRegistersData } = useSuspenseQuery({
    queryKey: ['myPreRegisters'],
    queryFn: () => preRegisterApi.getMyPreRegisters(),
  })

  const { data: ticketsData } = useSuspenseQuery({
    queryKey: ['myTickets'],
    queryFn: () => ticketsApi.getMyTickets(),
  })

  const preRegisters = preRegistersData.data.filter(
    (preRegister) => preRegister.status !== 'CANCELLED',
  )
  const tickets = ticketsData.data

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">내 티켓</h1>

        <Tabs defaultValue="preRegister" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="preRegister">사전등록</TabsTrigger>
            <TabsTrigger value="purchased">구매완료</TabsTrigger>
          </TabsList>

          <TabsContent value="preRegister">
            {preRegisters.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <TicketIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>사전등록 내역이 없습니다</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                {preRegisters.map((preRegister) => (
                  <Card
                    key={preRegister.id}
                    className="overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg"
                    onClick={() =>
                      navigate({ to: '/events/$id', params: { id: String(preRegister.eventId) } })
                    }
                  >
                    <div className="relative h-48">
                      <img
                        src={preRegister.imageUrl}
                        alt={preRegister.eventTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold">{preRegister.eventTitle}</h3>
                        <Badge className="bg-green-100 text-green-800 border-none">사전등록</Badge>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>공연일: {formatDateTime(preRegister.eventDate).date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>장소: {preRegister.place}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TicketIcon className="w-4 h-4" />
                          <span>
                            티켓 오픈: {formatDateTime(preRegister.ticketOpenAt).date}{' '}
                            {formatDateTime(preRegister.ticketOpenAt).time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          <span>등록일: {formatDateTime(preRegister.createdAt).date}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="purchased">
            {tickets.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <TicketIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>구매한 티켓이 없습니다</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                {tickets.map((ticket) => (
                  <Card key={ticket.ticketId} className="overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold">{ticket.eventTitle}</h3>
                        <Badge className={getTicketStatusBadgeClass(ticket.ticketStatus)}>
                          {getTicketStatusText(ticket.ticketStatus)}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <TicketIcon className="w-4 h-4" />
                          <span>
                            좌석: {ticket.seatGrade} - {ticket.seatCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>발급일: {formatDateTime(ticket.issuedAt).date}</span>
                        </div>
                        {ticket.usedAt && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>사용일: {formatDateTime(ticket.usedAt).date}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <BadgeDollarSignIcon className="w-4 h-4" />
                          <span>가격: {ticket.seatPrice.toLocaleString()}원</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          className="flex-1"
                          onClick={() => setSelectedTicketId(String(ticket.ticketId))}
                        >
                          티켓 상세보기
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        {ticket.ticketStatus === 'ISSUED' && (
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() =>
                              setTransferTicket({
                                ticketId: ticket.ticketId,
                                eventTitle: ticket.eventTitle,
                              })
                            }
                          >
                            양도하기
                            <Send className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {selectedTicketId && (
        <MyTicketDetailModal
          open={!!selectedTicketId}
          onOpenChange={(open) => !open && setSelectedTicketId(null)}
          ticketId={selectedTicketId}
        />
      )}

      {transferTicket && (
        <TransferTicketModal
          open={!!transferTicket}
          onOpenChange={(open) => !open && setTransferTicket(null)}
          ticketId={transferTicket.ticketId}
          eventTitle={transferTicket.eventTitle}
        />
      )}
    </div>
  )
}
