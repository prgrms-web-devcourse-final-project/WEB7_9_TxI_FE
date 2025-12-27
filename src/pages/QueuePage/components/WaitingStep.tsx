import { queueApi } from '@/api/queue'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { useQueryClient } from '@tanstack/react-query'
import { Clock, Loader2, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'
import type { WaitingStepProps } from '../types'

export function WaitingStep({
  queuePosition,
  estimatedWaitTime,
  progress,
  isConnected,
  eventId,
  onProcessComplete,
}: WaitingStepProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isDev = import.meta.env.DEV
  const queryClient = useQueryClient()

  const handleProcessUntilMe = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      await queueApi.processIncludeMe(eventId)
      await queryClient.invalidateQueries({ queryKey: ['queueStatus', eventId] })
      onProcessComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : '처리 중 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
        <h1 className="text-3xl font-bold mb-2">대기열에서 순서를 기다리는 중입니다</h1>
        <p className="text-gray-600">공정한 랜덤 큐 시스템으로 모두에게 동등한 기회를 제공합니다</p>
      </div>

      <Card className="p-6 mb-6 border-red-200 ">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-red-600 mb-2">⏰ 구매 시간 제한 안내</div>
            <p className="text-sm text-gray-600">
              입장 준비가 완료된 시점부터 <span className="font-bold text-red-600">15분 이내</span>
              로 티켓팅을 완료하지 않으면 자동으로 다음 순번으로 넘어갑니다.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-8 mb-6">
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {queuePosition.toLocaleString()}
          </div>
          <div className="text-xl text-gray-600">현재 대기 순번</div>
        </div>

        <div className="space-y-6">
          <div>
            <Progress value={Math.round(progress)} className="h-5 mb-10" title="전체 진행률" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">예상 대기 시간</div>
                <div className="text-xl font-bold">{estimatedWaitTime}분</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">앞 대기 인원</div>
                <div className="text-xl font-bold">{queuePosition.toLocaleString()}명</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-blue-200 bg-blue-50">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          실시간 업데이트
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
            <div>
              <div className="text-gray-600">10초마다 100명씩 입장 처리 중</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div
              className={`w-2 h-2 rounded-full mt-2 ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}
            />
            <div>
              <div className="text-gray-600">WebSocket {isConnected ? '연결됨' : '연결 중...'}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
            <div>
              <div className="text-gray-600">페이지를 새로고침하지 마세요</div>
            </div>
          </div>
        </div>
      </Card>

      {isDev && (
        <Card className="p-6 mt-6 border-yellow-200 bg-yellow-50">
          <p className="text-sm text-gray-600 mb-4">
            이 버튼은 대기열을 건너뛰고 바로 입장 단계로 이동합니다. (개발/로컬 환경 전용)
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={handleProcessUntilMe}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? '처리 중...' : '대기열 건너뛰기 (테스트)'}
          </button>
        </Card>
      )}
    </div>
  )
}
