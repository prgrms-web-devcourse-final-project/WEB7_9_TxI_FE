import { Badge } from '@/components/ui/Badge'
import { Clock } from 'lucide-react'
import type { QueueHeaderProps } from '../types'

export function QueueHeader({ step, minutes, seconds }: QueueHeaderProps) {
  return (
    <header className=" bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-end">
        {step !== 'waiting' ? (
          <Badge className="bg-red-100 text-red-800 animate-pulse">
            <Clock className="w-3 h-3 mr-1" />
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Badge>
        ) : (
          <Badge className="bg-blue-100 text-blue-600">대기 중</Badge>
        )}
      </div>
    </header>
  )
}
