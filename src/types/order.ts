export interface CreateOrderRequest {
  amount: number
  eventId: number
  seatId: number
}

export interface CreateOrderResponse {
  orderId: number
  orderKey: string
  ticketId: number
  amount: number
}

export interface ConfirmPaymentRequest {
  orderId: number
  amount: number
  paymentKey: string
}

export interface ConfirmPaymentResponse {
  orderId: number
  orderKey: string
  orderNumber: string
  paymentKey: string
  paidAt: string
  orderStatus: string
  amount: number
  ticketId: number
  ticketStatus: string
  eventId: number
  eventTitle: string
  eventPlace: string
  eventDate: string
  seatId: number
  seatCode: string
  seatGrade: string
  seatPrice: number
  paymentMethod: string
}

// 토스페이먼츠 결제 확인 응답 (v2)
export interface V2_PaymentConfirmResponse {
  orderId: string  // UUID 문자열
  success: boolean
  amount: number
  paidAt: string  // LocalDateTime → ISO 8601 문자열
  paymentMethod: string
  ticketId: number
  eventTitle: string
  eventPlace: string
  eventDate: string  // LocalDateTime → ISO 8601 문자열
  seatCode: string
  seatGrade: string  // enum → 문자열
}

// 토스페이먼츠용 주문 준비 API (v2)
export interface PrepareOrderRequest {
  eventId: number
  seatId: number
  amount: number
}

export interface PrepareOrderResponse {
  orderId: string
  orderName: string
  amount: number
}

// 토스페이먼츠용 결제 확인 요청 (v2)
export interface ConfirmTossPaymentRequest {
  orderId: string  // UUID 문자열
  amount: number
  paymentKey: string
}
