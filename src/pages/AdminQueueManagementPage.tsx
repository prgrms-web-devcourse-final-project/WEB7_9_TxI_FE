import { adminQueuesApi } from '@/api/admin/queue'
import { eventsApi } from '@/api/events'
import { ConfirmModal } from '@/components/ConfirmModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
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
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface QueueUser {
  userId: number
  username: string
  email: string
  queuePosition: number
  assignedAt: string
  status: 'WAITING' | 'ENTERED' | 'PAID' | 'EXPIRED'
}

export default function AdminQueueManagementPage() {
  const { eventId } = useParams({ from: '/admin/queue/$eventId' })
  const { isAuthenticated, accessToken } = useAuthStore()
  const queryClient = useQueryClient()

  const userRole = getRoleFromToken(accessToken)
  const isAdmin = userRole === 'ADMIN'
  
  // accessToken이 있으면 인증된 것으로 간주 (로그인 직후 상태 업데이트 지연 대응)
  const hasAuth = isAuthenticated || !!accessToken

  const [queueUsers, setQueueUsers] = useState<QueueUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isShuffleModalOpen, setIsShuffleModalOpen] = useState(false)

  const { data: eventData, error: eventError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.getEventById(eventId),
    enabled: hasAuth && isAdmin,
    retry: false, // 에러 발생 시 재시도하지 않음
    throwOnError: false, // 에러를 ErrorBoundary로 전파하지 않음
  })

  const { data: queueStatsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['admin', 'queue', 'statistics', eventId],
    queryFn: () => adminQueuesApi.getQueueStatistics(Number(eventId)),
    enabled: hasAuth && isAdmin && !!eventId,
  })

  const shuffleMutation = useMutation({
    mutationFn: (data: { preRegisteredUserIds: number[] }) =>
      adminQueuesApi.shuffleQueue(Number(eventId), data),
    onSuccess: () => {
      toast.success('대기열이 랜덤하게 재배정되었습니다')
      queryClient.invalidateQueries({ queryKey: ['admin', 'queue', 'statistics', eventId] })
      loadQueueUsers()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  useEffect(() => {
    if (eventId && hasAuth && isAdmin) {
      loadQueueUsers()
    }
  }, [eventId, hasAuth, isAdmin])

  const loadQueueUsers = async () => {
    // TODO: 실제 API가 추가되면 교체
    // const response = await adminQueuesApi.getQueueUsers(Number(eventId))
    // setQueueUsers(response.data)

    // 임시 mock 데이터
    const mockQueueUsers: QueueUser[] = Array.from({ length: 20 }, (_, i) => ({
      userId: 1000 + i,
      username: `user${1000 + i}`,
      email: `user${1000 + i}@test.com`,
      queuePosition: i + 1,
      assignedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      status:
        i < 3
          ? 'WAITING'
          : i < 8
            ? 'ENTERED'
            : i < 15
              ? 'PAID'
              : 'EXPIRED',
    }))
    setQueueUsers(mockQueueUsers)
  }

  const handleManualShuffle = async () => {
    // 사전등록된 사용자 ID 목록을 가져와야 함
    // TODO: 실제 API에서 사전등록 사용자 목록을 가져오는 로직 추가
    const preRegisteredUserIds = queueUsers
      .filter((u) => u.status === 'WAITING' || u.status === 'ENTERED')
      .map((u) => u.userId)

    shuffleMutation.mutate({ preRegisteredUserIds })
    setIsShuffleModalOpen(false)
  }


  const filteredUsers = queueUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.queuePosition.toString().includes(searchQuery),
  )

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
      case 'PAID':
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

  // 라우트 가드에서 이미 권한 체크를 하므로 여기서는 hasAuth와 isAdmin만 확인
  if (!hasAuth || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">관리자 권한이 필요합니다.</p>
        </div>
      </div>
    )
  }

  if (isStatsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    )
  }

  const event = eventData?.data
  const queueStats = queueStatsData?.data

  // 이벤트 정보가 없어도 페이지는 표시 (에러 발생 시에도 계속 진행)
  const eventTitle = event?.title || `이벤트 ID: ${eventId}`

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

        <div className="grid md:grid-cols-2 gap-6 mb-8">
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
              {queueStatus.totalInQueue.toLocaleString()}
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">대기열 사용자 목록</h2>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder="이름, 이메일, 순번 검색..."
                className="w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm">순번</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">사용자 ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">이메일</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">배정 시간</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">상태</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.userId}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-semibold">#{user.queuePosition}</td>
                    <td className="py-3 px-4">{user.username}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(user.assignedAt).toLocaleString('ko-KR')}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">검색 결과가 없습니다</div>
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

