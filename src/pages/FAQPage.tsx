import { Card } from '@/components/ui/Card'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'WaitFair는 어떻게 공정한 티켓팅을 보장하나요?',
    answer:
      'WaitFair는 사전 등록과 랜덤 대기열 시스템을 사용합니다. 등록 마감 후 무작위로 순번을 배정하여 네트워크 속도나 기기 성능과 관계없이 모든 사용자에게 동등한 기회를 제공합니다.',
  },
  {
    question: '사전 등록은 언제 시작하나요?',
    answer:
      '각 이벤트마다 사전 등록 기간이 다릅니다. 이벤트 상세 페이지에서 등록 시작 및 마감 시간을 확인할 수 있습니다.',
  },
  {
    question: '암표를 어떻게 방지하나요?',
    answer:
      'Dynamic QR 코드와 소유권 체인 시스템을 사용합니다. 티켓은 실시간으로 변경되는 QR 코드로 발급되며, 모든 거래 이력이 기록되어 외부 거래와 위조를 원천 차단합니다.',
  },
  {
    question: '티켓 구매 후 환불이 가능한가요?',
    answer:
      '이벤트 시작 7일 전까지 전액 환불이 가능합니다. 7일 이내에는 주최자 정책에 따라 부분 환불 또는 환불이 불가할 수 있습니다. 자세한 내용은 각 이벤트의 환불 정책을 확인해주세요.',
  },
  {
    question: '대기 순번은 어떻게 확인하나요?',
    answer:
      '로그인 후 실시간으로 대기 순번과 예상 대기 시간을 확인할 수 있습니다. WebSocket 기반 실시간 알림으로 입장 순번이 되면 푸시 알림을 받을 수 있습니다.',
  },
  {
    question: '봇이나 매크로는 어떻게 차단하나요?',
    answer:
      '디바이스 핑거프린팅, 행동 패턴 분석, reCAPTCHA 등 다층 보안 시스템을 운영합니다. 비정상적인 접근이나 자동화된 요청은 실시간으로 감지되어 차단됩니다.',
  },
  {
    question: '플랫폼 내에서 티켓을 재판매할 수 있나요?',
    answer:
      '네, 가능합니다. WaitFair는 안전한 플랫폼 내 재판매 시스템을 제공합니다. 모든 거래는 투명하게 기록되며, 주최자가 설정한 가격 범위 내에서만 거래가 가능합니다.',
  },
]

function FAQAccordion({ faq, index }: { faq: FAQItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
            {index + 1}
          </span>
          <h3 className="font-semibold text-gray-900">{faq.question}</h3>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 pt-2 border-t border-gray-100">
          <p className="text-gray-600 leading-relaxed pl-12">{faq.answer}</p>
        </div>
      )}
    </Card>
  )
}

export default function FAQPage() {
  return (
    <>
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">자주 묻는 질문</h1>
            <p className="text-lg text-gray-600">WaitFair 이용에 대한 궁금한 점을 확인해보세요</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <FAQAccordion key={index} faq={faq} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
