import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export type MessageHandler = (message: IMessage) => void

export class WebSocketClient {
  private client: Client | null = null
  private subscriptions: Map<string, StompSubscription> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000

  constructor(
    private url: string,
    private getAccessToken: () => string | null,
  ) {}

  connect(onConnected?: () => void, onError?: (error: Error) => void): void {
    if (this.client?.connected) {
      console.log('WebSocket is already connected')
      onConnected?.()
      return
    }

    const token = this.getAccessToken()
    if (!token) {
      console.error('No access token available for WebSocket connection')
      onError?.(new Error('No access token'))
      return
    }

    this.client = new Client({
      webSocketFactory: () =>
        new SockJS(this.url, null, {
          transports: ['websocket'],
        }) as WebSocket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        onConnected?.()
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers.message)
        onError?.(new Error(frame.headers.message || 'STOMP error'))
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event)
        onError?.(new Error('WebSocket error'))
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected')
        this.handleReconnect(onConnected, onError)
      },
    })

    this.client.activate()
  }

  private handleReconnect(onConnected?: () => void, onError?: (error: Error) => void): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      )
      setTimeout(() => {
        this.connect(onConnected, onError)
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached')
      onError?.(new Error('Failed to reconnect'))
    }
  }

  subscribe(destination: string, callback: MessageHandler): void {
    if (!this.client?.connected) {
      console.error('Cannot subscribe: WebSocket is not connected')
      return
    }

    if (this.subscriptions.has(destination)) {
      console.log(`Already subscribed to ${destination}`)
      return
    }

    const subscription = this.client.subscribe(destination, callback)
    this.subscriptions.set(destination, subscription)
    console.log(`Subscribed to ${destination}`)
  }

  unsubscribe(destination: string): void {
    const subscription = this.subscriptions.get(destination)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(destination)
      console.log(`Unsubscribed from ${destination}`)
    }
  }

  disconnect(): void {
    for (const [, subscription] of this.subscriptions) {
      subscription.unsubscribe()
    }

    this.subscriptions.clear()

    if (this.client?.connected) {
      this.client.deactivate()
      console.log('WebSocket disconnected')
    }

    this.client = null
  }

  isConnected(): boolean {
    return this.client?.connected ?? false
  }
}

let webSocketInstance: WebSocketClient | null = null

export function getWebSocketClient(
  url: string,
  getAccessToken: () => string | null,
): WebSocketClient {
  if (!webSocketInstance) {
    webSocketInstance = new WebSocketClient(url, getAccessToken)
  }
  return webSocketInstance
}

export function disconnectWebSocket(): void {
  if (webSocketInstance) {
    webSocketInstance.disconnect()
    webSocketInstance = null
  }
}
