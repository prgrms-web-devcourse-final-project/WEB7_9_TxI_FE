import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    TossPayments: any
  }
}

interface UseTossPaymentsOptions {
  customerKey?: string
  amount: number
  orderId: string
  orderName: string
}

interface RequestPaymentOptions {
  successUrl: string
  failUrl: string
  customerEmail?: string
  customerName?: string
}

export function useTossPayments({ customerKey, amount, orderId, orderName }: UseTossPaymentsOptions) {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const widgetRef = useRef<any>(null)
  const tossPaymentsRef = useRef<any>(null)

  useEffect(() => {
    const loadWidget = async () => {
      try {
        setError(null)

        // SDK 로드 확인
        if (!window.TossPayments) {
          throw new Error('토스페이먼츠 SDK가 로드되지 않았습니다')
        }

        const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY

        if (!clientKey) {
          throw new Error('토스페이먼츠 클라이언트 키가 설정되지 않았습니다')
        }

        // TossPayments 객체 생성
        tossPaymentsRef.current = window.TossPayments(clientKey)

        // 위젯 생성 (비회원)
        widgetRef.current = tossPaymentsRef.current.widgets({
          customerKey: customerKey || window.TossPayments.ANONYMOUS,
        })

        // 금액 설정
        await widgetRef.current.setAmount({
          currency: 'KRW',
          value: amount,
        })

        setIsReady(true)
      } catch (err: any) {
        console.error('토스페이먼츠 초기화 실패:', err)
        setError(err.message)
        setIsReady(false)
      }
    }

    if (amount > 0 && orderId) {
      loadWidget()
    }
  }, [amount, orderId, orderName, customerKey])

  const renderPaymentMethods = async (selector: string) => {
    if (!widgetRef.current) {
      throw new Error('결제 위젯이 초기화되지 않았습니다')
    }

    try {
      await widgetRef.current.renderPaymentMethods({
        selector,
        variantKey: 'DEFAULT',
      })
    } catch (err: any) {
      console.error('결제 수단 렌더링 실패:', err)
      throw err
    }
  }

  const requestPayment = async (options: RequestPaymentOptions) => {
    if (!widgetRef.current) {
      throw new Error('결제 위젯이 초기화되지 않았습니다')
    }

    try {
      await widgetRef.current.requestPayment({
        orderId,
        orderName,
        successUrl: options.successUrl,
        failUrl: options.failUrl,
        customerEmail: options.customerEmail,
        customerName: options.customerName,
      })
    } catch (err: any) {
      console.error('결제 요청 실패:', err)
      throw err
    }
  }

  return {
    isReady,
    error,
    renderPaymentMethods,
    requestPayment,
  }
}
