import { ticketsApi } from '@/api/tickets'
import { Card } from '@/components/ui/Card'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import QRCode from 'react-qr-code'
import { Loader2, RefreshCw } from 'lucide-react'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isSameOrAfter)

interface QrCodeSectionProps {
  ticketId: number
  eventDate: string
}

export function QrCodeSection({ ticketId, eventDate }: QrCodeSectionProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [expirationSecond, setExpirationSecond] = useState<number>(60)
  const [refreshIntervalSecond, setRefreshIntervalSecond] = useState<number>(30)
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number>(0)
  const [tokenIssuedAt, setTokenIssuedAt] = useState<number | null>(null)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null)

  const generateQrTokenMutation = useMutation({
    mutationFn: () => ticketsApi.generateQrToken(ticketId),
    onSuccess: (response) => {
      const data = response.data
      setQrUrl(data.qrUrl)
      setExpirationSecond(data.expirationSecond)
      setRefreshIntervalSecond(data.refreshIntervalSecond)
      setTokenIssuedAt(Date.now())
      setTimeUntilExpiry(data.expirationSecond)
    },
    onError: (error) => {
      console.error('QR 토큰 발급 실패:', error)
    },
  })

  // 이벤트 시작일 체크
  const eventDateObj = dayjs(eventDate)
  const now = dayjs()
  const isEventStarted = now.isSameOrAfter(eventDateObj, 'day')

  // 초기 QR 토큰 발급
  useEffect(() => {
    if (isEventStarted && !qrUrl && !generateQrTokenMutation.isPending) {
      generateQrTokenMutation.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEventStarted, qrUrl])

  // 자동 갱신 타이머
  useEffect(() => {
    if (!isEventStarted || !qrUrl) return

    refreshTimerRef.current = setInterval(() => {
      if (!generateQrTokenMutation.isPending) {
        generateQrTokenMutation.mutate()
      }
    }, refreshIntervalSecond * 1000)

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEventStarted, qrUrl, refreshIntervalSecond])

  // 만료 카운트다운
  useEffect(() => {
    if (!isEventStarted || !tokenIssuedAt) return

    expiryTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - tokenIssuedAt) / 1000)
      const remaining = Math.max(0, expirationSecond - elapsed)
      setTimeUntilExpiry(remaining)

      if (remaining === 0 && !generateQrTokenMutation.isPending) {
        generateQrTokenMutation.mutate()
      }
    }, 1000)

    return () => {
      if (expiryTimerRef.current) {
        clearInterval(expiryTimerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEventStarted, tokenIssuedAt, expirationSecond])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
      if (expiryTimerRef.current) {
        clearInterval(expiryTimerRef.current)
      }
    }
  }, [])

  const formatEventDate = (date: string) => {
    return dayjs(date).format('YYYY.MM.DD (ddd)')
  }

  if (!isEventStarted) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-gray-800">QR 코드</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-blue-50 px-4 py-3 rounded-lg">
              <span className="text-blue-600">ℹ️</span>
              <p>
                QR 코드는 이벤트 시작일 ({formatEventDate(eventDate)})부터 확인할 수
                있습니다.
              </p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">QR 코드</h3>

        {generateQrTokenMutation.isPending && !qrUrl ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">QR 코드를 생성하는 중...</p>
          </div>
        ) : qrUrl ? (
          <>
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <QRCode
                value={qrUrl}
                size={200}
                level="M"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>

            <div className="flex flex-col items-center space-y-2 text-sm text-gray-600">
              {generateQrTokenMutation.isPending ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>QR 코드 갱신 중...</span>
                </div>
              ) : (
                <>
                  <p>
                    <span className="font-medium">{refreshIntervalSecond}초</span> 후 자동
                    갱신
                  </p>
                  {timeUntilExpiry > 0 && (
                    <p>
                      만료까지 <span className="font-medium">{timeUntilExpiry}초</span> 남음
                    </p>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-sm text-gray-600">QR 코드를 불러올 수 없습니다.</p>
            <button
              onClick={() => generateQrTokenMutation.mutate()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}

