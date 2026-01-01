import { eventsApi } from '@/api/events'
import { ticketsApi } from '@/api/tickets'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatDateTime } from '@/utils/format'
import { parseJwtPayload } from '@/utils/jwt'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useSearch, useNavigate } from '@tanstack/react-router'
import {
  Calendar,
  CheckCircle,
  MapPin,
  Ticket as TicketIcon,
  User,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface TicketInfo {
  ticketId: number
  eventId: number
  userId: number
  qrIssuedAt: number
}

export default function QrVerificationPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/tickets/verify' })
  const token = search.token as string | undefined

  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
    ticketId: number
    eventId: number
    eventTitle: string
    seatCode: string | null
    ownerNickname: string
    eventDate: string
    qrIssuedAt: string
  } | null>(null)

  // JWT 토큰에서 티켓 정보 추출
  useEffect(() => {
    if (!token) return

    const payload = parseJwtPayload(token)
    if (payload) {
      setTicketInfo({
        ticketId: payload.ticketId as number,
        eventId: payload.eventId as number,
        userId: payload.userId as number,
        qrIssuedAt: payload.iat as number,
      })
    }
  }, [token])

  // 이벤트 정보 조회
  const { data: eventData } = useQuery({
    queryKey: ['event', String(ticketInfo?.eventId)],
    queryFn: () => eventsApi.getEventById(String(ticketInfo!.eventId)),
    enabled: !!ticketInfo?.eventId,
  })

  const event = eventData?.data

  const validateQrMutation = useMutation({
    mutationFn: (qrToken: string) => ticketsApi.validateQrCode(qrToken),
    onSuccess: (response) => {
      setValidationResult(response.data)
      if (response.data.isValid) {
        toast.success('입장 처리가 완료되었습니다.')
      } else {
        toast.error(response.data.message)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'QR 코드 검증에 실패했습니다.')
    },
  })

  useEffect(() => {
    if (!token) {
      toast.error('QR 토큰이 없습니다.')
      navigate({ to: '/' })
    }
  }, [token, navigate])

  const handleEntryProcess = () => {
    if (!token) {
      toast.error('QR 토큰이 없습니다.')
      return
    }
    validateQrMutation.mutate(token)
  }

  if (!token || !ticketInfo) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">티켓 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">이벤트 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  const eventDate = event.eventDate ? formatDateTime(event.eventDate) : null
  const qrIssuedAt = ticketInfo.qrIssuedAt
    ? formatDateTime(new Date(ticketInfo.qrIssuedAt * 1000).toISOString())
    : null

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">티켓 입장 확인</h1>
          <p className="text-gray-600 mt-2">QR 코드를 스캔하여 입장을 확인합니다.</p>
        </div>

        {/* 입장 처리 전 티켓 정보 */}
        {!validationResult && (
          <Card className="p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <TicketIcon className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">티켓 번호</p>
                  <p className="text-gray-600">#{ticketInfo.ticketId}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">이벤트</p>
                  <p className="text-gray-900 text-lg font-semibold">{event.title}</p>
                </div>
              </div>
              {eventDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">이벤트 일시</p>
                    <p className="text-gray-600">
                      {eventDate.date} {eventDate.time}
                    </p>
                  </div>
                </div>
              )}
              {qrIssuedAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-500 text-sm">QR 발급 시간</p>
                    <p className="text-gray-600 text-sm">
                      {qrIssuedAt.date} {qrIssuedAt.time}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 입장 처리 결과 */}
        {validationResult ? (
          <Card className="p-6 space-y-6">
            <div
              className={`p-4 rounded-lg ${
                validationResult.isValid
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-red-50 border-2 border-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {validationResult.isValid ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <p
                    className={`font-semibold ${
                      validationResult.isValid ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {validationResult.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <TicketIcon className="w-5 h-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-gray-700">이벤트</p>
                  <p className="text-gray-900 text-lg font-semibold">
                    {validationResult.eventTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-700">좌석</p>
                  <p className="text-gray-900">
                    {validationResult.seatCode || '좌석 없음'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-700">티켓 소유자</p>
                  <p className="text-gray-900">{validationResult.ownerNickname}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-700">이벤트 일시</p>
                  {eventDate && (
                    <p className="text-gray-900">
                      {eventDate.date} {eventDate.time}
                    </p>
                  )}
                </div>
              </div>

              {qrIssuedAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-500 text-sm">QR 발급 시간</p>
                    <p className="text-gray-600 text-sm">
                      {qrIssuedAt.date} {qrIssuedAt.time}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  티켓 번호: #{validationResult.ticketId}
                </p>
              </div>
            </div>

            {validationResult.isValid && (
              <div className="pt-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => navigate({ to: '/' })}
                >
                  확인
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-6">
            <div className="text-center space-y-4 py-4">
              <Button
                className="w-full"
                size="lg"
                onClick={handleEntryProcess}
                disabled={validateQrMutation.isPending}
              >
                {validateQrMutation.isPending ? '처리 중...' : '입장 처리'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

