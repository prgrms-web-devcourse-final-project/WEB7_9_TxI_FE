import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Calendar, MapPin, Users as UsersIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { eventsApi } from '@/api/events'
import type { Event, EventStatus, EventCategory } from '@/types/event'
import { Suspense, useState } from 'react'
import dayjs from 'dayjs'
import { LoadingFallback } from '@/components/common/LoadingFallback'
import { ErrorBoundary } from 'react-error-boundary'
import { PageErrorFallback } from '@/components/common/ErrorFallback'

const EVENT_STATUS_MAP: Record<EventStatus, string> = {
  READY: '준비중',
  PRE_OPEN: '예매예정',
  QUEUE_READY: '대기중',
  OPEN: '예매중',
  CLOSED: '마감',
}

const EVENT_CATEGORY_MAP: Record<EventCategory, string> = {
  CONCERT: '콘서트',
  POPUP: '팝업스토어',
  DROP: '드롭',
}

function EventCard({ event }: { event: Event }) {
  const statusColors: Record<string, string> = {
    예매중: 'bg-blue-100 text-blue-700 border-blue-300',
    예매예정: 'bg-green-100 text-green-700 border-green-300',
    마감: 'bg-gray-100 text-gray-600 border-gray-300',
    준비중: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    대기중: 'bg-orange-100 text-orange-700 border-orange-300',
  }

  const displayStatus = EVENT_STATUS_MAP[event.status]
  const formattedDate = dayjs(event.ticketOpenAt).format('YYYY.MM.DD (ddd)')
  const formattedDeadline = dayjs(event.preCloseAt).format('YYYY.MM.DD')
  const priceRange =
    event.minPrice === event.maxPrice
      ? `${event.minPrice.toLocaleString()}원`
      : `${event.minPrice.toLocaleString()}원~${event.maxPrice.toLocaleString()}원`

  return (
    <Link to="/events/$id" params={{ id: String(event.id) }}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-video relative overflow-hidden bg-gray-100">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          <Badge className={`absolute top-3 right-3 ${statusColors[displayStatus]}`}>
            {displayStatus}
          </Badge>
        </div>
        <div className="p-5">
          <h3 className="text-xl font-bold mb-1">{event.title}</h3>
          <p className="text-gray-600 text-sm mb-4">
            {EVENT_CATEGORY_MAP[event.category] || event.category}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{event.place}</span>
            </div>
            {event.status !== 'CLOSED' && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UsersIcon className="w-4 h-4" />
                <span>등록 마감: {formattedDeadline}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-blue-600">{priceRange}</span>
            <Button
              size="sm"
              disabled={event.status === 'CLOSED'}
              className={event.status === 'CLOSED' ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {event.status === 'CLOSED' ? '마감됨' : '사전 등록'}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  )
}

function EventsList({
  statusFilter,
  categoryFilter,
}: {
  statusFilter?: EventStatus
  categoryFilter?: EventCategory
}) {
  const { data } = useSuspenseQuery({
    queryKey: ['events', { status: statusFilter, category: categoryFilter }],
    queryFn: () =>
      eventsApi.getEvents({
        status: statusFilter,
        category: categoryFilter,
        pageable: {
          page: 0,
          size: 20,
        },
      }),
  })

  const events = data.data.content

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">표시할 이벤트가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}

export default function EventsPage() {
  const [statusFilter, setStatusFilter] = useState<EventStatus | undefined>(undefined)
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | undefined>(undefined)

  return (
    <>
      <section className="py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">진행 중인 이벤트</h1>
            <p className="text-lg text-gray-600">공정한 방식으로 원하는 이벤트에 참여하세요</p>
          </div>
        </div>
      </section>

      <section className="py-6 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={!statusFilter && !categoryFilter ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter(undefined)
                setCategoryFilter(undefined)
              }}
            >
              전체
            </Button>
            <Button
              variant={statusFilter === 'OPEN' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('OPEN')
                setCategoryFilter(undefined)
              }}
            >
              예매중
            </Button>
            <Button
              variant={statusFilter === 'PRE_OPEN' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('PRE_OPEN')
                setCategoryFilter(undefined)
              }}
            >
              예매예정
            </Button>
            <Button
              variant={categoryFilter === 'CONCERT' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter(undefined)
                setCategoryFilter('CONCERT')
              }}
            >
              콘서트
            </Button>
            <Button
              variant={categoryFilter === 'POPUP' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter(undefined)
                setCategoryFilter('POPUP')
              }}
            >
              팝업스토어
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <ErrorBoundary FallbackComponent={PageErrorFallback}>
            <Suspense fallback={<LoadingFallback />}>
              <EventsList statusFilter={statusFilter} categoryFilter={categoryFilter} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            원하는 이벤트를 찾지 못하셨나요?
          </h2>
          <p className="text-gray-600 mb-6">새로운 이벤트가 계속 추가되고 있습니다</p>
          <Link to="/">
            <Button variant="outline" size="lg">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}
