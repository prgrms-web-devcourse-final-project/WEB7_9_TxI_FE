export const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    READY: '오픈 준비중',
    PRE_OPEN: '사전등록 진행중',
    PRE_CLOSED: '사전 등록 마감',
    QUEUE_READY: '대기열 준비 완료',
    OPEN: '티켓팅 진행중',
    CLOSED: '티켓팅 마감',
  }
  return statusMap[status] || status
}
