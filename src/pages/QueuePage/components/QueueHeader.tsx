import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/Badge'
import { Clock, Ticket } from 'lucide-react'
import type { QueueHeaderProps } from '../types'

export function QueueHeader({ step, minutes, seconds }: QueueHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">WaitFair</span>
        </Link>
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
