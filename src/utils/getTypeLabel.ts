import type { Notification } from '@/types/notification'
import { match } from 'ts-pattern'

export const getTypeLabel = (type: Notification['type']): string => {
  return match(type)
    .with('ticketing', () => '티켓팅')
    .with('registration', () => '사전등록')
    .with('payment', () => '결제')
    .with('info', () => '알림')
    .exhaustive()
}
