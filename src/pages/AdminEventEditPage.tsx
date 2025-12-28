import { adminEventsApi } from '@/api/admin/events'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { useAuthStore } from '@/stores/authStore'
import { getRoleFromToken } from '@/utils/auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Save, Activity } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { EventCategory, EventStatus } from '@/types/event'
import type { EventUpdateRequest, EventResponse } from '@/types/admin/event'


export default function AdminEventEditPage() {
  const { eventId } = useParams({ from: '/admin/events/$eventId/edit' })
  const navigate = useNavigate()
  const { isAuthenticated, accessToken } = useAuthStore()
  const queryClient = useQueryClient()

  const userRole = getRoleFromToken(accessToken)
  const isAdmin = userRole === 'ADMIN'
  const hasAuth = isAuthenticated || !!accessToken

  const [formData, setFormData] = useState<EventUpdateRequest>({
    title: '',
    category: 'CONCERT',
    place: '',
    description: '',
    imageUrl: '',
    minPrice: 0,
    maxPrice: 0,
    preOpenAt: '',
    preCloseAt: '',
    ticketOpenAt: '',
    ticketCloseAt: '',
    eventDate: '',
    maxTicketAmount: 0,
    status: 'READY',
  })

  const { data: eventData, isLoading } = useQuery({
    queryKey: ['admin', 'event', eventId],
    queryFn: () => adminEventsApi.getEventByIdForAdmin(eventId),
    enabled: hasAuth && isAdmin,
  })

  useEffect(() => {
    if (eventData?.data) {
      const event = eventData.data as EventResponse
      // 날짜와 시간 분리
      const ticketOpenDate = new Date(event.ticketOpenAt)
      const preOpenDate = new Date(event.preOpenAt)
      const preCloseDate = new Date(event.preCloseAt)
      const ticketCloseDate = event.ticketCloseAt ? new Date(event.ticketCloseAt) : null

      setFormData({
        title: event.title,
        category: event.category,
        place: event.place,
        description: event.description || '',
        imageUrl: event.imageUrl || '',
        minPrice: event.minPrice,
        maxPrice: event.maxPrice,
        preOpenAt: preOpenDate.toISOString().split('T')[0],
        preCloseAt: preCloseDate.toISOString().split('T')[0],
        ticketOpenAt: ticketOpenDate.toISOString().split('T')[0],
        ticketCloseAt: ticketCloseDate
          ? ticketCloseDate.toISOString().split('T')[0]
          : ticketOpenDate.toISOString().split('T')[0],
        eventDate: ticketOpenDate.toISOString().split('T')[0],
        maxTicketAmount: event.maxTicketAmount || 0,
        status: event.status,
      })
    }
  }, [eventData])

  const updateEventMutation = useMutation({
    mutationFn: (data: EventUpdateRequest) =>
      adminEventsApi.updateEvent(Number(eventId), data),
    onSuccess: () => {
      toast.success('이벤트가 수정되었습니다')
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'events', 'dashboard'] })
      navigate({ to: '/admin/events/$eventId', params: { eventId } })
    },
    onError: (error: Error) => {
      toast.error('이벤트 수정 실패', {
        description: error.message,
      })
    },
  })

  const handleChange = (field: keyof EventUpdateRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.place) {
      toast.error('필수 항목을 모두 입력해주세요')
      return
    }

    // 날짜와 시간을 ISO 형식으로 변환
    const updateData: EventUpdateRequest = {
      ...formData,
      preOpenAt: `${formData.preOpenAt}T00:00:00`,
      preCloseAt: `${formData.preCloseAt}T23:59:59`,
      ticketOpenAt: `${formData.ticketOpenAt}T00:00:00`,
      ticketCloseAt: `${formData.ticketCloseAt}T23:59:59`,
      eventDate: `${formData.eventDate}T00:00:00`,
    }

    updateEventMutation.mutate(updateData)
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
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/admin/events/$eventId" params={{ eventId }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              이벤트 관리로 돌아가기
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">이벤트 수정</h1>
          <p className="text-gray-600">이벤트 정보를 수정합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">기본 정보</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">이벤트 제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="이벤트 제목을 입력하세요"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">카테고리 *</Label>
                  <select
                    id="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value as EventCategory)}
                  >
                    <option value="CONCERT">콘서트</option>
                    <option value="POPUP">팝업</option>
                    <option value="DROP">드롭</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="place">장소 *</Label>
                  <Input
                    id="place"
                    value={formData.place}
                    onChange={(e) => handleChange('place', e.target.value)}
                    placeholder="예: 잠실종합운동장"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">이벤트 설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="이벤트에 대한 설명을 입력하세요"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">이미지 URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  placeholder="이미지 URL을 입력하세요"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">일정 설정</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="eventDate">이벤트 날짜 *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => handleChange('eventDate', e.target.value)}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preOpenAt">사전등록 시작일 *</Label>
                  <Input
                    id="preOpenAt"
                    type="date"
                    value={formData.preOpenAt}
                    onChange={(e) => handleChange('preOpenAt', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="preCloseAt">사전등록 마감일 *</Label>
                  <Input
                    id="preCloseAt"
                    type="date"
                    value={formData.preCloseAt}
                    onChange={(e) => handleChange('preCloseAt', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticketOpenAt">티켓팅 시작일 *</Label>
                  <Input
                    id="ticketOpenAt"
                    type="date"
                    value={formData.ticketOpenAt}
                    onChange={(e) => handleChange('ticketOpenAt', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ticketCloseAt">티켓팅 마감일 *</Label>
                  <Input
                    id="ticketCloseAt"
                    type="date"
                    value={formData.ticketCloseAt}
                    onChange={(e) => handleChange('ticketCloseAt', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">좌석 및 가격</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="maxTicketAmount">최대 티켓 수 *</Label>
                <Input
                  id="maxTicketAmount"
                  type="number"
                  value={formData.maxTicketAmount}
                  onChange={(e) => handleChange('maxTicketAmount', Number.parseInt(e.target.value) || 0)}
                  placeholder="예: 20000"
                  min="1"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minPrice">최소 가격 (원) *</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    value={formData.minPrice}
                    onChange={(e) => handleChange('minPrice', Number.parseInt(e.target.value) || 0)}
                    placeholder="원"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice">최대 가격 (원) *</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    value={formData.maxPrice}
                    onChange={(e) => handleChange('maxPrice', Number.parseInt(e.target.value) || 0)}
                    placeholder="원"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">이벤트 상태 *</Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as EventStatus)}
                >
                  <option value="READY">준비중</option>
                  <option value="PRE_OPEN">사전등록 진행중</option>
                  <option value="PRE_CLOSED">사전등록 마감</option>
                  <option value="QUEUE_READY">대기열 준비</option>
                  <option value="OPEN">판매중</option>
                  <option value="CLOSED">판매 종료</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" className="flex-1" asChild>
              <Link to="/admin/events/$eventId" params={{ eventId }}>
                취소
              </Link>
            </Button>
            <Button type="submit" className="flex-1" disabled={updateEventMutation.isPending}>
              {updateEventMutation.isPending ? (
                <>
                  <Activity className="w-4 h-4 animate-spin mr-2" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  수정 완료
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

