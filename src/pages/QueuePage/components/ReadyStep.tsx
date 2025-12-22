import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import type { ReadyStepProps } from '../types'

export function ReadyStep({ minutes, seconds, onEnter }: ReadyStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">입장 준비가 완료되었습니다!</h1>
        <p className="text-gray-600">이제 티켓을 구매하실 수 있습니다</p>
      </div>

      <Card className="p-6 mb-6 border-red-200 bg-red-50">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-red-600 mb-2">⏰ 구매 시간 제한 안내</div>
            <p className="text-sm text-gray-600">
              현 시점부터
              <span className="font-bold text-red-600">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              이내로 티켓팅을 완료하지 않으면 자동으로 다음 순번으로 넘어갑니다.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-8 mb-6 text-center">
        <div className="text-5xl font-bold text-blue-600 mb-2">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <p className="text-gray-600 mb-6">남은 시간 내에 구매를 완료해주세요</p>
        <Button size="lg" className="w-full" onClick={onEnter}>
          티켓 선택하기
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Card>

      <Card className="p-6 border-blue-200 bg-blue-50">
        <h3 className="font-bold mb-4">주의사항</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>15분 내에 구매하지 않으면 자동으로 다음 순번으로 넘어갑니다</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>1인당 최대 1매까지 구매 가능합니다</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
