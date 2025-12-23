import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Separator } from '@/components/ui/Separator'
import { CheckCircle2, Ticket } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { paymentsApi } from '@/api/payments'
import { ticketsApi } from '@/api/tickets'
import { eventsApi } from '@/api/events'
import { useSuspenseQuery } from '@tanstack/react-query'

interface PaymentSuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
}

export function PaymentSuccessModal({
  open,
  onOpenChange,
  orderId,
}: PaymentSuccessModalProps) {
  const { data: receiptData } = useSuspenseQuery({
    queryKey: ['payment-receipt', orderId],
    queryFn: () => paymentsApi.getReceipt(orderId),
  })

  const receipt = receiptData.data

  const { data: ticketData } = useSuspenseQuery({
    queryKey: ['ticket-detail', receipt.ticketId.toString()],
    queryFn: () => ticketsApi.getMyTicketDetail(receipt.ticketId.toString()),
  })

  const ticket = ticketData.data

  const { data: eventData } = useSuspenseQuery({
    queryKey: ['event', ticket.eventId.toString()],
    queryFn: () => eventsApi.getEventById(ticket.eventId.toString()),
  })

  const event = eventData.data

  const orderNumber = receipt.orderKey
  const orderDate = new Date(ticket.issuedAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  const eventDateTime = new Date(event.ticketOpenAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
            <DialogTitle>결제 완료!</DialogTitle>
            <p className="text-gray-600">티켓이 성공적으로 발급되었습니다</p>
          </div>
        </DialogHeader>

        <Card className="p-6 mt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">주문 정보</h2>
            <Badge className="text-sm px-3 py-1 bg-gray-100 text-gray-800">결제완료</Badge>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">주문번호</div>
                <div className="font-semibold">{orderNumber}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">결제일시</div>
                <div className="font-semibold">{orderDate}</div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-sm text-gray-600 mb-2">이벤트 정보</div>
              <div className="font-bold text-lg mb-1">{event.title}</div>
              <div className="text-sm text-gray-600">{eventDateTime}</div>
              <div className="text-sm text-gray-600">{event.place}</div>
            </div>

            <Separator />

            <div>
              <div className="text-sm text-gray-600 mb-2">좌석 정보</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold">티켓: {ticket.seatGrade}</div>
                    <div className="text-sm text-gray-600">{ticket.seatCode}</div>
                  </div>
                  <div className="font-bold">{ticket.seatPrice.toLocaleString()}원</div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-sm text-gray-600 mb-2">결제 정보</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">티켓 금액</span>
                  <span className="font-semibold">{receipt.amount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">예매 수수료</span>
                  <span className="font-semibold text-blue-600">무료</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결제 수단</span>
                  <span className="font-semibold">신용카드</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">최종 결제 금액</span>
                  <span className="font-bold text-blue-600 text-xl">
                    {receipt.amount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/events">다른 이벤트 보기</Link>
            </Button>
            <Button className="flex-1" asChild>
              <Link to="/my-tickets">
                <Ticket className="w-4 h-4 mr-2" />
                티켓 보기
              </Link>
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
