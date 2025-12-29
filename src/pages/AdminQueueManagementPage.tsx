import { adminQueuesApi } from '@/api/admin/queue'
import { adminPreRegistersApi } from '@/api/admin/preRegister'
import { adminEventsApi } from '@/api/admin/events'
import { ConfirmModal } from '@/components/ConfirmModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { useAuthStore } from '@/stores/authStore'
import { getRoleFromToken } from '@/utils/auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  Activity,
  Users,
  Shuffle,
  Search,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function AdminQueueManagementPage() {
  const { eventId } = useParams({ from: '/admin/queue/$eventId' })
  const { isAuthenticated, accessToken } = useAuthStore()
  const queryClient = useQueryClient()

  const userRole = getRoleFromToken(accessToken)
  const isAdmin = userRole === 'ADMIN'
  
  const hasAuth = isAuthenticated || !!accessToken

  const [searchQuery, setSearchQuery] = useState('')
  const [isShuffleModalOpen, setIsShuffleModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 20

  const { data: eventData, error: eventError } = useQuery({
    queryKey: ['admin', 'event', eventId],
    queryFn: () => adminEventsApi.getEventByIdForAdmin(eventId),
    enabled: hasAuth && isAdmin,
    retry: false, // 에러 발생 시 재시도하지 않음
    throwOnError: false, // 에러를 ErrorBoundary로 전파하지 않음
  })

  const { data: queueStatsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['admin', 'queue', 'statistics', eventId],
    queryFn: () => adminQueuesApi.getQueueStatistics(Number(eventId)),
    enabled: hasAuth && isAdmin && !!eventId,
  })

  const { data: preRegisterCountData } = useQuery({
    queryKey: ['admin', 'pre-registers', eventId, 'count'],
    queryFn: () => adminPreRegistersApi.getPreRegisterCountByEventId(Number(eventId)),
    enabled: hasAuth && isAdmin && !!eventId,
    retry: false,
    throwOnError: false,
  })

  const { data: queueEntriesData, isLoading: isQueueEntriesLoading, error: queueEntriesError } = useQuery({
    queryKey: ['admin', 'queue', 'entries', eventId, currentPage],
    queryFn: () =>
      adminQueuesApi.getQueueEntriesByEventId(Number(eventId), currentPage, pageSize),
    enabled: hasAuth && isAdmin && !!eventId,
    retry: false,
    throwOnError: false,
  })

  const queueEntries = queueEntriesData?.data?.content || []
  const hasQueueData = queueEntries.length > 0 && !queueEntriesError


  const { data: preRegisterData, isLoading: isPreRegisterLoading } = useQuery({
    queryKey: ['admin', 'pre-registers', eventId, currentPage],
    queryFn: () =>
      adminPreRegistersApi.getPreRegistersByEventId(Number(eventId), currentPage, pageSize),
    enabled: hasAuth && isAdmin && !!eventId && !hasQueueData,
    retry: false,
    throwOnError: false,
  })

  const shuffleMutation = useMutation({
    mutationFn: (data: { preRegisteredUserIds: number[] }) =>
      adminQueuesApi.shuffleQueue(Number(eventId), data),
    onSuccess: () => {
      toast.success('대기열이 랜덤하게 재배정되었습니다')
      queryClient.invalidateQueries({ queryKey: ['admin', 'queue', 'statistics', eventId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'queue', 'entries', eventId] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleManualShuffle = async () => {
    // 사전등록된 사용자 ID 목록을 가져와야 함
    // TODO: 실제 API에서 사전등록 사용자 목록을 가져오는 로직 추가
    const queueEntries = queueEntriesData?.data?.content || []
    const preRegisteredUserIds = queueEntries
      .filter((u) => u.queueEntryStatus === 'WAITING' || u.queueEntryStatus === 'ENTERED')
      .map((u) => u.id)

    shuffleMutation.mutate({ preRegisteredUserIds })
    setIsShuffleModalOpen(false)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = queueEntriesData?.data?.totalPages || 0

  // 대기열 데이터가 없으면 사전등록 데이터 사용
  const preRegisters = preRegisterData?.data?.content || []
  const preRegisterTotalPages = preRegisterData?.data?.totalPages || 0

  // 대기열 데이터가 있으면 대기열, 없으면 사전등록 데이터 필터링
  const filteredUsers = hasQueueData
    ? queueEntries.filter(
        (user) =>
          user.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.queueRank.toString().includes(searchQuery),
      )
    : preRegisters.filter((preRegister) =>
        preRegister.userEmail.toLowerCase().includes(searchQuery.toLowerCase()),
      )

  const showQueueTable = hasQueueData
  const hasPreRegisterData = preRegisters.length > 0
  const isEmpty = !hasQueueData && !hasPreRegisterData && !isPreRegisterLoading

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING':
        return <Badge className="border-gray-300">대기중</Badge>
      case 'ENTERED':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
            입장
          </Badge>
        )
      case 'COMPLETED':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300">
            결제 완료
          </Badge>
        )
      case 'EXPIRED':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300">만료</Badge>
        )
      default:
        return <Badge className="border-gray-300">{status}</Badge>
    }
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

  if (isStatsLoading || isQueueEntriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    )
  }

  const event = eventData?.data
  const queueStats = queueStatsData?.data

  const eventTitle = event?.title

  const queueStatus = {
    isActive: queueStats ? queueStats.waitingCount > 0 || queueStats.enteredCount > 0 : false,
    totalInQueue: queueStats?.totalCount || 0,
    currentPosition: queueStats?.enteredCount || 0,
    waitingCount: queueStats?.waitingCount || 0,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            대시보드로 돌아가기
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">대기열 관리</h1>
          <p className="text-gray-600">{eventTitle}</p>
          {eventError && (
            <p className="text-sm text-orange-600 mt-1">
              이벤트 정보를 불러올 수 없습니다. (에러: {eventError.message})
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {(preRegisterCountData?.data || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">사전 등록 인원</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <Badge
                className={
                  queueStatus.isActive
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                }
              >
                {queueStatus.isActive ? '활성' : '일시정지'}
              </Badge>
            </div>
            <div className="text-3xl font-bold mb-1">
              {queueStatus.waitingCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">대기 인원</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {queueStatus.currentPosition.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">현재 입장 인원</div>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">대기열 제어</h2>
            <Button onClick={() => setIsShuffleModalOpen(true)}>
              <Shuffle className="w-4 h-4 mr-2" />
              수동 셔플
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">
                {showQueueTable ? '대기열 사용자 목록' : '사전 등록 사용자 목록'}
              </h2>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder={showQueueTable ? '이름, 이메일, 순번 검색...' : '이메일 검색...'}
                  className="w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {!showQueueTable && eventData?.data?.ticketOpenAt && (
              <p className="text-sm text-blue-600 mt-2">
                {(() => {
                  try {
                    const ticketOpenAt = new Date(eventData.data.ticketOpenAt)
                    if (isNaN(ticketOpenAt.getTime())) {
                      return null
                    }
                    const queueStartAt = new Date(ticketOpenAt.getTime() - 60 * 60 * 1000)
                    return `티켓팅 시작 시간 1시간 전인 ${queueStartAt.toLocaleString('ko-KR')} 에 대기열이 랜덤으로 생성됩니다.`
                  } catch (error) {
                    console.error('Error formatting dates:', error)
                    return null
                  }
                })()}
              </p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {showQueueTable ? (
                    <>
                      <th className="text-left py-3 px-4 font-semibold text-sm">순번</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">이메일</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">배정 시간</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">입장 시간</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">만료 시간</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">상태</th>
                    </>
                  ) : (
                    <>
                      <th className="text-left py-3 px-4 font-semibold text-sm">이메일</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">사전 등록 시간</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {showQueueTable ? (
                  filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">
                        {searchQuery ? '검색 결과가 없습니다' : '대기열 항목이 없습니다'}
                      </td>
                    </tr>
                  ) : (
                    (filteredUsers as typeof queueEntries).map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-semibold">#{entry.queueRank}</td>
                        <td className="py-3 px-4 text-gray-600">{entry.userEmail}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(entry.createdAt).toLocaleString('ko-KR')}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {entry.enteredAt ? (
                            new Date(entry.enteredAt).toLocaleString('ko-KR')
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {entry.expiredAt ? (
                            new Date(entry.expiredAt).toLocaleString('ko-KR')
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(entry.queueEntryStatus)}</td>
                      </tr>
                    ))
                  )
                ) : (
                  filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center py-12 text-gray-500">
                        {searchQuery
                          ? '검색 결과가 없습니다'
                          : isEmpty
                            ? '등록된 항목이 없습니다'
                            : '사전 등록 항목이 없습니다'}
                      </td>
                    </tr>
                  ) : (
                    (filteredUsers as typeof preRegisters).map((preRegister) => (
                      <tr
                        key={preRegister.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-gray-600">{preRegister.userEmail}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(preRegister.createdAt).toLocaleString('ko-KR')}
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>

          {!searchQuery &&
            (showQueueTable ? totalPages > 1 : preRegisterTotalPages > 1) && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={showQueueTable ? totalPages : preRegisterTotalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
        </Card>
      </main>

      <ConfirmModal
        open={isShuffleModalOpen}
        onOpenChange={setIsShuffleModalOpen}
        onConfirm={handleManualShuffle}
        title="수동 셔플"
        description="대기열 순서를 랜덤하게 재배정하시겠습니까?"
        confirmText="셔플"
        cancelText="취소"
        isLoading={shuffleMutation.isPending}
      />
    </div>
  )
}

