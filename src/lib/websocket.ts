import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export type MessageHandler = (message: IMessage) => void

export class WebSocketClient {
  private client: Client | null = null
  private subscriptions: Map<string, StompSubscription> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private isConnecting = false
  private connectCallbacks: Array<() => void> = []
  private errorCallbacks: Array<(error: Error) => void> = []

  constructor(
    private url: string,
    private getAccessToken: () => string | null,
  ) {}

  connect(onConnected?: () => void, onError?: (error: Error) => void): void {
    if (onConnected) {
      this.connectCallbacks.push(onConnected)
    }
    if (onError) {
      this.errorCallbacks.push(onError)
    }

    if (this.client?.connected) {
      console.log('WebSocket is already connected')
      onConnected?.()
      return
    }

    if (this.isConnecting) {
      console.log('WebSocket connection is in progress, callback registered')
      return
    }

    const token = this.getAccessToken()
    if (!token) {
      console.error('No access token available for WebSocket connection')
      const error = new Error('No access token')
      this.triggerErrorCallbacks(error)
      return
    }

    this.isConnecting = true

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.url) as WebSocket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('STOMP Debug:', str)
      },
      reconnectDelay: 0,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected successfully')
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.triggerConnectCallbacks()
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers.message, frame)
        this.isConnecting = false
        const error = new Error(frame.headers.message || 'STOMP error')
        this.triggerErrorCallbacks(error)
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event)
        this.isConnecting = false
        const error = new Error('WebSocket connection failed')
        this.triggerErrorCallbacks(error)
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected')
        this.isConnecting = false
        this.handleReconnect()
      },
    })

    this.client.activate()
  }

  private triggerConnectCallbacks(): void {
    const callbacks = [...this.connectCallbacks]
    this.connectCallbacks = []
    callbacks.forEach((callback) => {
      try {
        callback()
      } catch (error) {
        console.error('Error in connect callback:', error)
      }
    })
  }

  private triggerErrorCallbacks(error: Error): void {
    const callbacks = [...this.errorCallbacks]
    this.errorCallbacks = []
    callbacks.forEach((callback) => {
      try {
        callback(error)
      } catch (err) {
        console.error('Error in error callback:', err)
      }
    })
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      )
      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached')
      const error = new Error('Failed to reconnect')
      this.triggerErrorCallbacks(error)
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
    this.connectCallbacks = []
    this.errorCallbacks = []
    this.isConnecting = false

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
