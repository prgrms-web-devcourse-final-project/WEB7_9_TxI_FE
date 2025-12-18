import type { Notification } from '@/types/notification'
import { match } from 'ts-pattern'

export const getTypeColor = (type: Notification['type']): string => {
  return match(type)
    .with('ticketing', () => 'bg-blue-600/20 text-blue-600')
    .with('registration', () => 'bg-purple-600/20 text-purple-600')
    .with('payment', () => 'bg-green-500/20 text-green-700')
    .with('info', () => 'bg-gray-200 text-gray-600')
    .exhaustive()
}
