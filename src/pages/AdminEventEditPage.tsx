import { adminEventsApi } from '@/api/admin/events'
import { adminS3Api } from '@/api/admin/s3'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { useAuthStore } from '@/stores/authStore'
import { getRoleFromToken } from '@/utils/auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Save, Activity, Upload, X } from 'lucide-react'
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

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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

  const [dateTimeFields, setDateTimeFields] = useState({
    eventDate: { date: '', time: '' },
    preOpenAt: { date: '', time: '' },
    preCloseAt: { date: '', time: '' },
    ticketOpenAt: { date: '', time: '' },
    ticketCloseAt: { date: '', time: '' },
  })

  const { data: eventData, isLoading, error: eventError } = useQuery({
    queryKey: ['admin', 'event', eventId],
    queryFn: () => adminEventsApi.getEventByIdForAdmin(eventId),
    enabled: hasAuth && isAdmin,
    retry: false,
    throwOnError: false,
  })

  const splitDateTime = (dateTimeString: string) => {
    if (!dateTimeString) {
      return { date: '', time: '' }
    }
    
    const date = new Date(dateTimeString)
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateTimeString)
      return { date: '', time: '' }
    }
    
    // 로컬 타임존으로 변환하여 날짜와 시간 추출
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
    }
  }

  useEffect(() => {
    if (eventData?.data) {
      const event = eventData.data as EventResponse
      
      const ticketOpenDateTime = splitDateTime(event.ticketOpenAt)
      const preOpenDateTime = splitDateTime(event.preOpenAt)
      const preCloseDateTime = splitDateTime(event.preCloseAt)
      const ticketCloseDateTime = event.ticketCloseAt
        ? splitDateTime(event.ticketCloseAt)
        : splitDateTime(event.ticketOpenAt)
      const eventDateTime = splitDateTime(event.eventDate || event.ticketOpenAt)

      setFormData({
        title: event.title || '',
        category: event.category || 'CONCERT',
        place: event.place || '',
        description: event.description || '',
        imageUrl: event.imageUrl || '',
        minPrice: event.minPrice || 0,
        maxPrice: event.maxPrice || 0,
        preOpenAt: event.preOpenAt || '',
        preCloseAt: event.preCloseAt || '',
        ticketOpenAt: event.ticketOpenAt || '',
        ticketCloseAt: event.ticketCloseAt || event.ticketOpenAt || '',
        eventDate: event.eventDate || event.ticketOpenAt || '',
        maxTicketAmount: event.maxTicketAmount || 0,
        status: event.status || 'READY',
      })

      setDateTimeFields({
        eventDate: eventDateTime,
        preOpenAt: preOpenDateTime,
        preCloseAt: preCloseDateTime,
        ticketOpenAt: ticketOpenDateTime,
        ticketCloseAt: ticketCloseDateTime,
      })

      // 기존 이미지가 있으면 미리보기 설정
      if (event.imageUrl && event.imageUrl.trim() !== '') {
        // imageUrl이 이미 URL 형식인지 확인
        if (event.imageUrl.startsWith('http://') || event.imageUrl.startsWith('https://')) {
          setImagePreview(event.imageUrl)
        } else {
          // objectKey인 경우, 백엔드에서 이미지 URL을 제공하는 API를 통해 표시
          // 백엔드 API 엔드포인트 형식에 맞게 수정 필요
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.waitfair.shop/api/v1'
          // objectKey를 URL 인코딩하여 안전하게 처리
          const imageUrl = `${baseUrl}/images/${encodeURIComponent(event.imageUrl)}`
          setImagePreview(imageUrl)
        }
      } else {
        // 이미지가 없으면 미리보기 초기화
        setImagePreview(null)
      }
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

  const handleDateTimeChange = (
    field: keyof typeof dateTimeFields,
    type: 'date' | 'time',
    value: string,
  ) => {
    setDateTimeFields((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [type]: value,
      },
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error('이미지 크기는 10MB 이하여야 합니다')
      return
    }

    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      toast.error('지원하는 이미지 형식: JPG, JPEG, PNG, GIF, WEBP')
      return
    }

    setIsUploadingImage(true)

    try {
      // 1. Presigned URL 발급 요청
      const presignedResponse = await adminS3Api.issueEventImageUploadUrl(file.name)
      const { uploadUrl, objectKey } = presignedResponse.data

      // 2. 미리보기용 FileReader
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // 3. S3에 PUT 요청으로 파일 업로드
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('이미지 업로드에 실패했습니다')
      }

      // 4. 성공 시 objectKey를 formData에 저장
      setFormData((prev) => ({
        ...prev,
        imageUrl: objectKey,
      }))

      toast.success('이미지가 업로드되었습니다')
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('이미지 업로드 실패', {
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
      })
      setImagePreview(null)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setFormData((prev) => ({ ...prev, imageUrl: '' }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.place) {
      toast.error('필수 항목을 모두 입력해주세요')
      return
    }

    const combineDateTime = (date: string, time: string) => {
      if (!date || !time) return ''
      return `${date}T${time}:00`
    }

    const updateData: EventUpdateRequest = {
      ...formData,
      preOpenAt: combineDateTime(dateTimeFields.preOpenAt.date, dateTimeFields.preOpenAt.time),
      preCloseAt: combineDateTime(dateTimeFields.preCloseAt.date, dateTimeFields.preCloseAt.time),
      ticketOpenAt: combineDateTime(
        dateTimeFields.ticketOpenAt.date,
        dateTimeFields.ticketOpenAt.time,
      ),
      ticketCloseAt: combineDateTime(
        dateTimeFields.ticketCloseAt.date,
        dateTimeFields.ticketCloseAt.time,
      ),
      eventDate: combineDateTime(dateTimeFields.eventDate.date, dateTimeFields.eventDate.time),
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

  if (eventError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">이벤트를 불러올 수 없습니다.</p>
          <p className="text-sm text-red-600 mb-4">
            {eventError instanceof Error ? eventError.message : '알 수 없는 오류'}
          </p>
          <Button variant="outline" asChild>
            <Link to="/admin">대시보드로 돌아가기</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!eventData?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">이벤트를 찾을 수 없습니다.</p>
          <Button variant="outline" asChild>
            <Link to="/admin">대시보드로 돌아가기</Link>
          </Button>
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
                <Label>이미지</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                        disabled={isUploadingImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="image-upload"
                      className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg transition-colors ${
                        isUploadingImage
                          ? 'cursor-not-allowed bg-gray-100'
                          : 'cursor-pointer hover:bg-gray-50'
                      }`}
                    >
                      {isUploadingImage ? (
                        <>
                          <Activity className="w-8 h-8 text-gray-400 mb-2 animate-spin" />
                          <p className="text-sm text-gray-600">이미지 업로드 중...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">클릭하여 이미지 업로드</p>
                        </>
                      )}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">일정 설정</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="eventDate">이벤트 날짜 *</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    id="eventDate"
                    type="date"
                    value={dateTimeFields.eventDate.date}
                    onChange={(e) => handleDateTimeChange('eventDate', 'date', e.target.value)}
                    required
                  />
                  <Input
                    id="eventDateTime"
                    type="time"
                    value={dateTimeFields.eventDate.time}
                    onChange={(e) => handleDateTimeChange('eventDate', 'time', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preOpenAt">사전등록 시작일 *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="preOpenAt"
                      type="date"
                      value={dateTimeFields.preOpenAt.date}
                      onChange={(e) => handleDateTimeChange('preOpenAt', 'date', e.target.value)}
                      required
                    />
                    <Input
                      id="preOpenAtTime"
                      type="time"
                      value={dateTimeFields.preOpenAt.time}
                      onChange={(e) => handleDateTimeChange('preOpenAt', 'time', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="preCloseAt">사전등록 마감일 *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="preCloseAt"
                      type="date"
                      value={dateTimeFields.preCloseAt.date}
                      onChange={(e) => handleDateTimeChange('preCloseAt', 'date', e.target.value)}
                      required
                    />
                    <Input
                      id="preCloseAtTime"
                      type="time"
                      value={dateTimeFields.preCloseAt.time}
                      onChange={(e) => handleDateTimeChange('preCloseAt', 'time', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticketOpenAt">티켓팅 시작일 *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="ticketOpenAt"
                      type="date"
                      value={dateTimeFields.ticketOpenAt.date}
                      onChange={(e) => handleDateTimeChange('ticketOpenAt', 'date', e.target.value)}
                      required
                    />
                    <Input
                      id="ticketOpenAtTime"
                      type="time"
                      value={dateTimeFields.ticketOpenAt.time}
                      onChange={(e) => handleDateTimeChange('ticketOpenAt', 'time', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="ticketCloseAt">티켓팅 마감일 *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="ticketCloseAt"
                      type="date"
                      value={dateTimeFields.ticketCloseAt.date}
                      onChange={(e) => handleDateTimeChange('ticketCloseAt', 'date', e.target.value)}
                      required
                    />
                    <Input
                      id="ticketCloseAtTime"
                      type="time"
                      value={dateTimeFields.ticketCloseAt.time}
                      onChange={(e) => handleDateTimeChange('ticketCloseAt', 'time', e.target.value)}
                      required
                    />
                  </div>
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
                  <option value="OPEN">티켓팅 진행중</option>
                  <option value="CLOSED">마감</option>
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

