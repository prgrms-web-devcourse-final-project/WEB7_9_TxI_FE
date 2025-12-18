import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'

dayjs.extend(relativeTime)
dayjs.locale('ko')

export function formatTimestamp(timestamp: string): string {
  const now = dayjs()
  const time = dayjs(timestamp)
  const diffInMinutes = now.diff(time, 'minute')
  const diffInHours = now.diff(time, 'hour')
  const diffInDays = now.diff(time, 'day')

  if (diffInMinutes < 1) {
    return '방금 전'
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`
  }

  if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  }

  if (diffInDays < 7) {
    return `${diffInDays}일 전`
  }

  return time.format('YYYY.MM.DD HH:mm')
}
