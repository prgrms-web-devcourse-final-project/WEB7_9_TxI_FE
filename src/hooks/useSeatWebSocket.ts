import { getWebSocketClient } from '@/lib/websocket'
import { useAuthStore } from '@/stores/authStore'
import type { Seat, SeatStatusChangeEvent } from '@/types/seat'
import { useEffect, useState } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'https://api.waitfair.shop/ws'

interface UseSeatWebSocketParams {
  eventId: number
  enabled?: boolean
}

export function useSeatWebSocket({ eventId, enabled = true }: UseSeatWebSocketParams) {
  const [seatChanges, setSeatChanges] = useState<SeatStatusChangeEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const { accessToken, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!enabled || !isAuthenticated || !accessToken) {
      return
    }

    const wsClient = getWebSocketClient(WS_URL, () => accessToken)

    const handleConnect = () => {
      setIsConnected(true)

      const seatDestination = `/topic/events/${eventId}/seats`
      wsClient.subscribe(seatDestination, (message) => {
        try {
          console.log('Seat WebSocket - Raw body:', message.body)
          const event: SeatStatusChangeEvent = JSON.parse(message.body)
          console.log('Seat WebSocket - Parsed event:', event)

          setSeatChanges((prev) => {
            const updated = [event, ...prev]
            return updated.slice(0, 100)
          })
        } catch (error) {
          console.error('Seat WebSocket parsing error:', error)
          console.error('Seat WebSocket - Failed to parse body:', message.body)
        }
      })
    }

    const handleError = (error: Error) => {
      throw new Error('Seat WebSocket error: ' + error.message)
    }

    wsClient.connect(handleConnect, handleError)

    return () => {
      wsClient.unsubscribe(`/topic/events/${eventId}/seats`)
    }
  }, [enabled, isAuthenticated, accessToken, eventId])

  const getSeatLatestStatus = (seatId: number): SeatStatusChangeEvent | undefined => {
    return seatChanges.find((change) => change.seatId === seatId)
  }

  const clearSeatChanges = () => {
    setSeatChanges([])
  }

  return {
    seatChanges,
    isConnected,
    getSeatLatestStatus,
    clearSeatChanges,
  }
}

export function applySeatChanges(seats: Seat[], changes: SeatStatusChangeEvent[]): Seat[] {
  const updatedSeats = [...seats]

  // 각 seatId의 최신 변경사항만 추출 (changes 배열의 첫 번째 = 최신)
  const latestChanges = new Map<number, SeatStatusChangeEvent>()
  for (const change of changes) {
    if (!latestChanges.has(change.seatId)) {
      latestChanges.set(change.seatId, change)
    }
  }

  // 최신 상태만 적용
  for (const change of latestChanges.values()) {
    const seatIndex = updatedSeats.findIndex((seat) => seat.id === change.seatId)
    if (seatIndex !== -1) {
      updatedSeats[seatIndex] = {
        ...updatedSeats[seatIndex],
        seatStatus: change.currentStatus,
      }
    }
  }

  return updatedSeats
}
