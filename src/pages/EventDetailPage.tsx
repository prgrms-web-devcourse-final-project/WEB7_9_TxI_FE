import { eventsApi } from '@/api/events'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { formatDateTime, formatPriceRange } from '@/utils/format'
import { getStatusText } from '@/utils/getStatusText'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Clock, MapPin, Shield, Tag } from 'lucide-react'

export default function EventDetailPage() {
  const { id } = useParams({ from: '/events/$id' })

  const { data } = useSuspenseQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getEventById(id),
  })

  const { data: preRegisterCountData } = useSuspenseQuery({
    queryKey: ['event', id, 'pre-register-count'],
    queryFn: () => eventsApi.getPreRegisterCount(id),
  })

  const event = data.data
  const preRegisterCount = preRegisterCountData.data

  const ticketDateTime = formatDateTime(event.ticketOpenAt)
  const preOpenDateTime = formatDateTime(event.preOpenAt)
  const preCloseDateTime = formatDateTime(event.preCloseAt)

  return (
    <>
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-3">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            이벤트 목록으로
          </Link>
        </div>
      </div>

      <div className="relative h-64 md:h-96 bg-gray-200 overflow-hidden">
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <Badge className="mb-3 bg-blue-600 text-white border-blue-600">
              {getStatusText(event.status)}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
            <p className="text-lg">{event.category}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">이벤트 정보</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">티켓 오픈 일시</p>
                    <p className="text-gray-600">
                      {ticketDateTime.date} {ticketDateTime.time} 시작
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">장소</p>
                    <p className="text-gray-600">{event.place}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">카테고리</p>
                    <p className="text-gray-600">{event.category}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">사전 등록 기간</p>
                    <p className="text-gray-600">
                      {preOpenDateTime.date} ~ {preCloseDateTime.date}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {event.description && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">상세 설명</h2>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">가격 정보</h2>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-lg font-bold text-blue-600">
                  {formatPriceRange(event.minPrice, event.maxPrice)}
                </p>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <Progress
                value={preRegisterCount}
                max={event.maxTicketAmount}
                className="mb-6"
                title="사전 등록 진행률"
              />
              <Button className="w-full mb-3" size="lg" asChild>
                <Link to="/events/$id/register" params={{ id }}>
                  사전 등록하기
                </Link>
              </Button>
              <Button variant="outline" className="w-full">
                알림 받기
              </Button>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>공정한 랜덤 큐 시스템으로 모두에게 평등한 기회를 제공합니다</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
