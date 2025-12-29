import { adminEventsApi } from '@/api/admin/events'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/stores/authStore'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Users,
  Activity,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Clock,
  Plus,
} from 'lucide-react'
import { getRoleFromToken } from '@/utils/auth'

export default function AdminDashboardPage() {
  const { isAuthenticated, accessToken } = useAuthStore()

  const userRole = getRoleFromToken(accessToken)
  const isAdmin = userRole === 'ADMIN'
  
  const hasAuth = isAuthenticated || !!accessToken

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'events', 'dashboard'],
    queryFn: () => adminEventsApi.getEventsDashboard(),
    enabled: hasAuth && isAdmin,
  })

  const eventStats = (data?.data || []).filter((event) => event.deleted !== true)

  const stats = [
    {
      label: '총 이벤트',
      value: eventStats.length.toString(),
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      label: '총 사전등록',
      value: eventStats
        .reduce((acc, e) => acc + e.preRegisterCount, 0)
        .toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: '판매된 좌석',
      value: eventStats
        .reduce((acc, e) => acc + e.totalSoldSeats, 0)
        .toLocaleString(),
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      label: '총 매출액',
      value: `₩${eventStats
        .reduce((acc, e) => acc + e.totalSalesAmount, 0)
        .toLocaleString()}`,
      icon: Activity,
      color: 'text-blue-600',
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRE_OPEN':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
            <Clock className="w-3 h-3 mr-1" />
            사전등록중
          </Badge>
        )
      case 'OPEN':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300">
            <Activity className="w-3 h-3 mr-1" />
            티켓팅 진행중
          </Badge>
        )
      case 'CLOSED':
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            완료
          </Badge>
        )
      default:
        return <Badge className="border-gray-300">대기</Badge>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
            <p className="text-gray-600">실시간 이벤트 및 대기열 모니터링</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/admin/events/new">
                <Plus className="w-4 h-4 mr-2" />
                새 이벤트 생성
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </Card>
          ))}
        </div>

        <div className="mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">이벤트 현황</h2>
            </div>
            <div className="space-y-6">
              {eventStats.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  등록된 이벤트가 없습니다.
                </div>
              ) : (
                eventStats.map((event) => (
                  <div
                    key={event.eventId}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold mb-1">{event.title}</h3>
                        <div className="flex gap-3 text-sm text-gray-600">
                          <span>
                            사전등록: {event.preRegisterCount.toLocaleString()}명
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">판매 현황</span>
                        <span className="font-semibold">
                          {event.totalSoldSeats.toLocaleString()}석
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">총 매출액</span>
                        <span className="font-semibold">
                          ₩{event.totalSalesAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link to="/admin/events/$eventId" params={{ eventId: String(event.eventId) }}>
                          이벤트 관리
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link to="/admin/queue/$eventId" params={{ eventId: String(event.eventId) }}>
                          대기열 관리
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link to="/admin/seats/$eventId" params={{ eventId: String(event.eventId) }}>
                          좌석 관리
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}