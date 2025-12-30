import { adminEventsApi } from '@/api/admin/events'
import { ConfirmModal } from '@/components/ConfirmModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/stores/authStore'
import { getRoleFromToken } from '@/utils/auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, Users, Ticket, Activity } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { EventStatus } from '@/types/event'

const getStatusBadge = (status: EventStatus) => {
  switch (status) {
    case 'READY':
      return <Badge className="bg-gray-100 text-gray-700 border-gray-300">준비중</Badge>
    case 'PRE_OPEN':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-300">사전등록 진행중</Badge>
    case 'PRE_CLOSED':
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">사전등록 마감</Badge>
      )
    case 'QUEUE_READY':
      return <Badge className="bg-purple-100 text-purple-700 border-purple-300">대기열 준비</Badge>
    case 'OPEN':
      return <Badge className="bg-green-100 text-green-700 border-green-300">판매중</Badge>
    case 'CLOSED':
      return <Badge className="bg-red-100 text-red-700 border-red-300">판매 종료</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-700 border-gray-300">{status}</Badge>
  }
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'CONCERT':
      return '콘서트'
    case 'POPUP':
      return '팝업'
    case 'DROP':
      return '드롭'
    default:
      return category
  }
}

export default function AdminEventManagementPage() {
  const { eventId } = useParams({ from: '/admin/events/$eventId' })
  const navigate = useNavigate()
  const { isAuthenticated, accessToken } = useAuthStore()
  const queryClient = useQueryClient()

  const userRole = getRoleFromToken(accessToken)
  const isAdmin = userRole === 'ADMIN'
  const hasAuth = isAuthenticated || !!accessToken

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [eventId])

  const { data: eventData, isLoading } = useQuery({
    queryKey: ['admin', 'event', eventId],
    queryFn: () => adminEventsApi.getEventByIdForAdmin(eventId),
    enabled: hasAuth && isAdmin,
    retry: false,
    throwOnError: false,
  })

  const { data: dashboardData } = useQuery({
    queryKey: ['admin', 'events', 'dashboard'],
    queryFn: () => adminEventsApi.getEventsDashboard(),
    enabled: hasAuth && isAdmin,
  })

  const event = eventData?.data
  const dashboardEvent = dashboardData?.data?.content
    ?.filter((e) => e.deleted !== true)
    ?.find((e) => e.eventId === Number(eventId))

  const deleteEventMutation = useMutation({
    mutationFn: () => adminEventsApi.deleteEvent(Number(eventId)),
    onSuccess: () => {
      setIsDeleteModalOpen(false)
      toast.success('이벤트가 삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['admin', 'events', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] })
      navigate({ to: '/admin' })
    },
    onError: (error: Error) => {
      toast.error('이벤트 삭제 실패', {
        description: error.message,
      })
    },
  })

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }

  if (!hasAuth || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">관리자 권한이 필요합니다.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">이벤트를 찾을 수 없습니다.</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/admin">대시보드로 돌아가기</Link>
          </Button>
        </div>
      </div>
    )
  }

  const salesRate =
    dashboardEvent && event.maxTicketAmount > 0
      ? (dashboardEvent.totalSoldSeats / event.maxTicketAmount) * 100
      : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            대시보드로 돌아가기
          </Link>
        </Button>

        <Card className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                  {getCategoryLabel(event.category)}
                </Badge>
                {getStatusBadge(event.status)}
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600 font-bold mb-1">이벤트 날짜</div>
                  <div className="font-medium">
                    {new Date(event.ticketOpenAt).toLocaleString('ko-KR')}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600 font-bold mb-1">장소</div>
                  <div className="font-medium">{event.place}</div>
                </div>
              </div>

              {dashboardEvent && (
                <>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600 font-bold mb-1">사전등록 인원</div>
                      <div className="font-medium">
                        {dashboardEvent.preRegisterCount.toLocaleString()}명
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Ticket className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600 font-bold mb-1">판매 좌석</div>
                      <div className="font-medium">
                        {dashboardEvent.totalSoldSeats.toLocaleString()}석
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {event.description && (
              <div>
                <div className="text-sm text-gray-600 font-bold mb-1">이벤트 설명</div>
                <p className="text-gray-900 leading-relaxed">{event.description}</p>
              </div>
            )}

            {dashboardEvent && (
              <div>
                <div className="text-sm text-gray-600 font-bold mb-2">판매 현황</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${Math.min(salesRate, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-16 text-right">
                    {isNaN(salesRate) ? '0.0' : salesRate.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600 font-bold">
                  총 매출액: ₩{dashboardEvent.totalSalesAmount.toLocaleString()}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 space-y-4">
              <h3 className="font-semibold text-lg">일정 정보</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 font-bold mb-1">사전등록 시작일</div>
                  <div className="text-sm font-medium">
                    {new Date(event.preOpenAt).toLocaleString('ko-KR')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-bold mb-1">사전등록 마감일</div>
                  <div className="text-sm font-medium">
                    {new Date(event.preCloseAt).toLocaleString('ko-KR')}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 font-bold mb-1">티켓팅 시작일</div>
                  <div className="text-sm font-medium">
                    {new Date(event.ticketOpenAt).toLocaleString('ko-KR')}
                  </div>
                </div>
                {event.ticketCloseAt && (
                  <div>
                    <div className="text-sm text-gray-500 font-bold mb-1">티켓팅 마감일</div>
                    <div className="text-sm font-medium">
                      {new Date(event.ticketCloseAt).toLocaleString('ko-KR')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-lg mb-2">가격 범위</h3>
              <div className="text-sm font-medium">
                {event.minPrice.toLocaleString()}원 ~ {event.maxPrice.toLocaleString()}원
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" asChild>
              <Link to="/admin/events/$eventId/edit" params={{ eventId }}>
                <Edit className="w-4 h-4 mr-2" />
                이벤트 수정
              </Link>
            </Button>
            <Button className="flex-1" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              이벤트 삭제
            </Button>
          </div>
        </Card>
      </main>

      <ConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={() => {
          deleteEventMutation.mutate()
        }}
        title="이벤트 삭제"
        description="정말로 이 이벤트를 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        isLoading={deleteEventMutation.isPending}
      />
    </div>
  )
}
