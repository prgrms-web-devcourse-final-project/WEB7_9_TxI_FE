import { ChevronDown, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { EventCategory, EventStatus } from '@/types/event'

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const getStatusLabel = () => {
    if (statusFilter === undefined) return '전체'
    return EVENT_STATUS_MAP[statusFilter]
  }

  const statusOptions: Array<{ value: EventStatus | undefined; label: string }> = [
    { value: undefined, label: '전체' },
    { value: 'PRE_OPEN', label: '사전등록 진행중' },
    { value: 'PRE_CLOSED', label: '사전등록 마감' },
    { value: 'QUEUE_READY', label: '대기열 준비 완료' },
    { value: 'OPEN', label: '티켓팅 진행중' },
    { value: 'CLOSED', label: '티켓팅 마감' },
  ]

  return (
    <section className="py-6 bg-white sticky top-[73px] z-40 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-6 border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setCategoryFilter(undefined)}
              className={`pb-3 px-2 font-medium text-base md:text-lg transition-all whitespace-nowrap ${
                categoryFilter === undefined
                  ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
              }`}
            >
              전체
            </button>
            {(Object.entries(EVENT_CATEGORY_MAP) as [EventCategory, string][]).map(
              ([category, label]) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`pb-3 px-2 font-medium text-base md:text-lg transition-all whitespace-nowrap ${
                    categoryFilter === category
                      ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ),
            )}
          </div>

          <div className="flex items-center gap-3" ref={dropdownRef}>
            <label className="text-sm font-semibold text-gray-700">상태</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px] justify-between transition-all shadow-sm hover:shadow-md"
              >
                <span>{getStatusLabel()}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-fade-in">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value || 'all'}
                      type="button"
                      onClick={() => {
                        setStatusFilter(option.value)
                        setIsDropdownOpen(false)
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-all flex items-center justify-between ${
                        statusFilter === option.value
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      <span>{option.label}</span>
                      {statusFilter === option.value && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
