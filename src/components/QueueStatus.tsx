import { Card } from '@/components/ui/Card'
import { useQueueWebSocket } from '@/hooks/useQueueWebSocket'
import { AlertCircle, Clock, TrendingUp, WifiOff } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'

interface QueueStatusProps {
  eventId: number
}

export function QueueStatus({ eventId }: QueueStatusProps) {
  const {
    queuePosition,
    estimatedWaitTime,
    progress,
    personalEvent,
    isConnected,
    clearPersonalEvent,
  } = useQueueWebSocket({ eventId })

  useEffect(() => {
    if (!personalEvent) return

    if ('enteredAt' in personalEvent) {
      toast.success('입장 완료!', {
        description: personalEvent.message,
      })
    } else if ('expiredAt' in personalEvent) {
      toast.error('시간 만료', {
        description: personalEvent.message,
      })
    } else if ('completedAt' in personalEvent) {
      toast.success('결제 완료!', {
        description: personalEvent.message,
      })
    }

    clearPersonalEvent()
  }, [personalEvent, clearPersonalEvent])

  if (!isConnected) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-gray-600">
          <WifiOff className="w-5 h-5" />
          <span>대기열 연결 중...</span>
        </div>
      </Card>
    )
  }

  if (queuePosition === null) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-600">대기열 정보를 불러오는 중...</div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">대기열 상태</h3>
          {isConnected && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              <span>실시간 연결</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">진행률</span>
            <span className="font-semibold text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600 mb-1">현재 순번</p>
              <p className="text-2xl font-bold text-blue-600">{queuePosition}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600 mb-1">예상 대기 시간</p>
              <p className="text-2xl font-bold text-purple-600">
                {estimatedWaitTime ? `${estimatedWaitTime}분` : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            순번이 가까워지면 알림을 보내드립니다. 창을 닫지 마세요!
          </p>
        </div>
      </div>
    </Card>
  )
}
