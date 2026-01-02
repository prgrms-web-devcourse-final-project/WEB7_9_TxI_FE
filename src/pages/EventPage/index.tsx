import { eventsApi } from '@/api/events'
import { PageErrorFallback } from '@/components/common/ErrorFallback'
import { LoadingFallback } from '@/components/common/LoadingFallback'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import type { EventCategory, EventStatus } from '@/types/event'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { EventCard } from './EventCard'
import { EventFilterSection } from './EventFiliterSection'

export default function EventsPage() {
  const [statusFilter, setStatusFilter] = useState<EventStatus | undefined>(undefined)
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(0)

  const { data } = useSuspenseQuery({
    queryKey: ['events', { status: statusFilter, category: categoryFilter, page: currentPage }],
    queryFn: () =>
      eventsApi.getEvents({
        status: statusFilter,
        category: categoryFilter,
        pageable: {
          page: currentPage,
          size: 9,
        },
      }),
  })

  const events = data.data.content.filter((event) => event.deleted !== true)
  const totalPages = data.data.totalPages

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFilterChange = (
    type: 'status' | 'category',
    value: EventStatus | EventCategory | undefined,
  ) => {
    setCurrentPage(0)
    if (type === 'status') {
      setStatusFilter(value as EventStatus | undefined)
    } else {
      setCategoryFilter(value as EventCategory | undefined)
    }
  }

  return (
    <>
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">진행 중인 이벤트</h1>
            <p className="text-lg text-gray-600">선착순 걱정 없이, 공정하게 예매하세요.</p>
          </div>
        </div>
      </section>
      <EventFilterSection
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        setStatusFilter={(status) => handleFilterChange('status', status)}
        setCategoryFilter={(category) => handleFilterChange('category', category)}
      />

      <section className="py-12">
        <div className="container mx-auto px-4">
          <ErrorBoundary FallbackComponent={PageErrorFallback}>
            <Suspense fallback={<LoadingFallback />}>
              {events.length === 0 ? (
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
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>
    </>
  )
}
