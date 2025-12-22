import { Button } from '@/components/ui/Button'
import type { EventCategory, EventStatus } from '@/types/event'

const EVENT_STATUS_MAP: Record<EventStatus, string> = {
  READY: '준비중',
  PRE_OPEN: '사전등록',
  PRE_CLOSED: '사전 등록 마감',
  QUEUE_READY: '대기',
  OPEN: '예매중',
  CLOSED: '마감',
}

const EVENT_CATEGORY_MAP: Record<EventCategory, string> = {
  CONCERT: '콘서트',
  POPUP: '팝업스토어',
  DROP: '드롭',
}

export function EventFilterSection({
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
}: {
  statusFilter?: EventStatus
  categoryFilter?: EventCategory
  setStatusFilter: (status: EventStatus | undefined) => void
  setCategoryFilter: (category: EventCategory | undefined) => void
}) {
  return (
    <section className="py-6 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">상태</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === undefined ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(undefined)}
              >
                전체
              </Button>
              {(Object.entries(EVENT_STATUS_MAP) as [EventStatus, string][]).map(
                ([status, label]) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {label}
                  </Button>
                ),
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">카테고리</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={categoryFilter === undefined ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(undefined)}
              >
                전체
              </Button>
              {(Object.entries(EVENT_CATEGORY_MAP) as [EventCategory, string][]).map(
                ([category, label]) => (
                  <Button
                    key={category}
                    variant={categoryFilter === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter(category)}
                  >
                    {label}
                  </Button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
