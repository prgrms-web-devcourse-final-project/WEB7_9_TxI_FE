import type { Notification } from '@/types/notification'
import { match } from 'ts-pattern'

export const getTypeColor = (type: Notification['type']): string => {
  return match(type)
    .with('ticketing', () => 'bg-blue-600/20 text-blue-600 border-none')
    .with('registration', () => 'bg-purple-600/20 text-purple-600 border-none')
    .with('payment', () => 'bg-green-500/20 text-green-700 border-none')
    .with('info', () => 'bg-gray-200 text-gray-600 border-none')
    .exhaustive()
}
