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
      <section className="relative overflow-hidden py-16 md:py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.08),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              진행 중인 이벤트
            </h1>
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
                <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                  <div className="container mx-auto px-4 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                        원하는 이벤트를 찾지 못하셨나요?
                      </h2>
                      <p className="text-gray-600 mb-8 leading-relaxed">새로운 이벤트가 계속 추가되고 있습니다</p>
                      <Link to="/">
                        <Button variant="outline" size="lg" className="hover:scale-105 transition-transform duration-300">
                          홈으로 돌아가기
                        </Button>
                      </Link>
                    </div>
                  </div>
                </section>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                  {events.map((event, index) => (
                    <div
                      key={event.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <EventCard event={event} />
                    </div>
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
