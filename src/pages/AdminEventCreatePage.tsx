import { adminEventsApi } from '@/api/admin/events'
import { adminS3Api } from '@/api/admin/s3'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { useAuthStore } from '@/stores/authStore'
import { getRoleFromToken } from '@/utils/auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Upload, X, Activity } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { EventCategory } from '@/types/event'
import type { EventCreateRequest } from '@/types/admin/event'

export default function AdminEventCreatePage() {
  const navigate = useNavigate()
  const { isAuthenticated, accessToken } = useAuthStore()
  const queryClient = useQueryClient()

  const userRole = getRoleFromToken(accessToken)
  const isAdmin = userRole === 'ADMIN'
  const hasAuth = isAuthenticated || !!accessToken

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState<Omit<EventCreateRequest, 'preOpenAt' | 'preCloseAt' | 'ticketOpenAt' | 'ticketCloseAt' | 'eventDate'>>({
    title: '',
    category: 'CONCERT',
    description: '',
    place: '',
    imageUrl: '',
    minPrice: 0,
    maxPrice: 0,
    maxTicketAmount: 0,
  })

  // 날짜와 시간을 분리하여 저장
  const [dateTimeFields, setDateTimeFields] = useState({
    eventDate: { date: '', time: '' },
    preOpenAt: { date: '', time: '' },
    preCloseAt: { date: '', time: '' },
    ticketOpenAt: { date: '', time: '' },
    ticketCloseAt: { date: '', time: '' },
  })

  const createEventMutation = useMutation({
    mutationFn: (data: EventCreateRequest) => adminEventsApi.createEvent(data),
    onSuccess: () => {
      toast.success('이벤트가 생성되었습니다')
      queryClient.invalidateQueries({ queryKey: ['admin', 'events', 'dashboard'] })
      navigate({ to: '/admin' })
    },
    onError: (error: Error) => {
      toast.error('이벤트 생성 실패', {
        description: error.message,
      })
      setIsSubmitting(false)
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value === '' ? 0 : Number(value) }))
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, category: e.target.value as EventCategory }))
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

    // 파일 크기 검증 (예: 10MB 제한)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error('이미지 크기는 10MB 이하여야 합니다')
      return
    }

    // 파일 확장자 검증
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

  const validateDates = () => {
    const { preOpenAt, preCloseAt, ticketOpenAt, ticketCloseAt } = dateTimeFields

    if (!preOpenAt.date || !preOpenAt.time || !preCloseAt.date || !preCloseAt.time) {
      toast.error('사전등록 시작일과 종료일을 모두 입력해주세요')
      return false
    }

    if (!ticketOpenAt.date || !ticketOpenAt.time || !ticketCloseAt.date || !ticketCloseAt.time) {
      toast.error('티켓팅 시작일과 종료일을 모두 입력해주세요')
      return false
    }

    const preOpen = new Date(`${preOpenAt.date}T${preOpenAt.time}:00`)
    const preClose = new Date(`${preCloseAt.date}T${preCloseAt.time}:00`)
    const ticketOpen = new Date(`${ticketOpenAt.date}T${ticketOpenAt.time}:00`)
    const ticketClose = new Date(`${ticketCloseAt.date}T${ticketCloseAt.time}:00`)

    if (preOpen >= preClose) {
      toast.error('사전등록 종료일은 시작일보다 이후여야 합니다')
      return false
    }

    if (preClose >= ticketOpen) {
      toast.error('티켓팅 시작일은 사전등록 종료일보다 이후여야 합니다')
      return false
    }

    if (ticketOpen >= ticketClose) {
      toast.error('티켓팅 종료일은 시작일보다 이후여야 합니다')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateDates()) {
      return
    }

    if (!formData.title || !formData.category || !formData.place) {
      toast.error('필수 항목을 모두 입력해주세요')
      return
    }

    setIsSubmitting(true)

    // 날짜와 시간을 ISO 형식으로 변환
    const combineDateTime = (date: string, time: string) => {
      if (!date || !time) return ''
      return `${date}T${time}:00`
    }

    const createData: EventCreateRequest = {
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

    createEventMutation.mutate(createData)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              대시보드로 돌아가기
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">새 이벤트 생성</h1>
          <p className="text-gray-600">새로운 티켓팅 이벤트를 등록하고 관리하세요</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">기본 정보</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">이벤트 제목 *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="예: 2025 서울 뮤직 페스티벌"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">카테고리 *</Label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={formData.category}
                  onChange={handleCategoryChange}
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
                  name="place"
                  value={formData.place}
                  onChange={handleInputChange}
                  placeholder="예: 서울 올림픽공원 체조경기장"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="이벤트에 대한 자세한 설명을 입력하세요"
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

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">일정 정보</h2>
            <div className="space-y-6">
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

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="preOpenAt">사전등록 시작 *</Label>
                  <div className="grid md:grid-cols-2 gap-2">
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
                  <Label htmlFor="preCloseAt">사전등록 종료 *</Label>
                  <div className="grid md:grid-cols-2 gap-2">
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

                <div>
                  <Label htmlFor="ticketOpenAt">티켓팅 시작 *</Label>
                  <div className="grid md:grid-cols-2 gap-2">
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
                  <Label htmlFor="ticketCloseAt">티켓팅 종료 *</Label>
                  <div className="grid md:grid-cols-2 gap-2">
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

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">좌석 및 가격 정보</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="maxTicketAmount">최대 티켓 수 *</Label>
                <Input
                  id="maxTicketAmount"
                  name="maxTicketAmount"
                  type="number"
                  min="1"
                  value={formData.maxTicketAmount}
                  onChange={handleNumberChange}
                  placeholder="예: 20000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="minPrice">최소 가격 (원)</Label>
                <Input
                  id="minPrice"
                  name="minPrice"
                  type="number"
                  min="0"
                  value={formData.minPrice}
                  onChange={handleNumberChange}
                  placeholder="예: 50000"
                />
              </div>

              <div>
                <Label htmlFor="maxPrice">최대 가격 (원)</Label>
                <Input
                  id="maxPrice"
                  name="maxPrice"
                  type="number"
                  min="0"
                  value={formData.maxPrice}
                  onChange={handleNumberChange}
                  placeholder="예: 150000"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" asChild>
              <Link to="/admin">취소</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                '이벤트 생성'
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

