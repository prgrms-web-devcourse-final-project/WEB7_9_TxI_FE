import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { Event, EventCategory, EventStatus } from '@/types/event'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Calendar, MapPin } from 'lucide-react'
import { match } from 'ts-pattern'

type DateInfo = {
  label: string
  date: string
  secondLabel?: string
  secondDate?: string
} | null

const EVENT_STATUS_MAP: Record<EventStatus, string> = {
  READY: '오픈 준비중',
  PRE_OPEN: '사전등록 진행중',
  PRE_CLOSED: '사전등록 마감',
  QUEUE_READY: '대기열 준비 완료',
  OPEN: '티켓팅 진행중',
  CLOSED: '티켓팅 마감',
}

const EVENT_CATEGORY_MAP: Record<EventCategory, string> = {
  CONCERT: '콘서트',
  POPUP: '팝업스토어',
  DROP: '드롭',
}

const statusColors: Record<string, string> = {
  '티켓팅 진행중': 'bg-blue-100 text-blue-700 border-blue-300',
  '사전등록 진행중': 'bg-green-100 text-green-700 border-green-300',
  '사전등록 마감': 'bg-gray-100 text-gray-600 border-gray-300',
  '티켓팅 마감': 'bg-gray-100 text-gray-600 border-gray-300',
  '오픈 준비중': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  '대기열 준비 완료': 'bg-orange-100 text-orange-700 border-orange-300',
}

export function EventCard({ event }: { event: Event }) {
  const displayStatus = EVENT_STATUS_MAP[event.status]

  const dateInfo: DateInfo = match(event.status)
    .with('OPEN', () => ({
      label: '티켓 오픈 마감일',
      date: dayjs(event.ticketCloseAt).format('YYYY.MM.DD (ddd)'),
    }))
    .with('PRE_OPEN', () => ({
      label: '사전 등록 마감일',
      date: dayjs(event.preCloseAt).format('YYYY.MM.DD (ddd)'),
    }))
    .with('READY', () => ({
      label: '사전 등록 오픈일',
      date: dayjs(event.preOpenAt).format('YYYY.MM.DD (ddd)'),
      secondLabel: '티켓 오픈일',
      secondDate: dayjs(event.ticketOpenAt).format('YYYY.MM.DD (ddd)'),
    }))
    .otherwise(() => null)

  return (
    <Link to="/events/$id" params={{ id: String(event.id) }}>
      <Card className="h-[460px] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-video relative overflow-hidden bg-gray-100">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          <Badge className={`absolute top-3 right-3 ${statusColors[displayStatus] || ''}`}>
            {displayStatus}
          </Badge>
        </div>
        <div className="p-5">
          <Badge className="mb-3">{EVENT_CATEGORY_MAP[event.category] || event.category}</Badge>
          <h3 className="text-xl font-bold mb-1">{event.title}</h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{event.place}</span>
            </div>
            {dateInfo && (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {dateInfo.label}: {dateInfo.date}
                  </span>
                </div>
                {dateInfo.secondLabel && dateInfo.secondDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {dateInfo.secondLabel}: {dateInfo.secondDate}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
