import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'

interface TermsAgreementProps {
  agreedTerms: boolean
  setAgreedTerms: (agreed: boolean) => void
  agreedRefund: boolean
  setAgreedRefund: (agreed: boolean) => void
}

export function TermsAgreement({
  agreedTerms,
  setAgreedTerms,
  agreedRefund,
  setAgreedRefund,
}: TermsAgreementProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">약관 동의</h2>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={agreedTerms}
            onCheckedChange={(checked) => setAgreedTerms(!!checked)}
          />
          <div className="flex-1">
            <Label htmlFor="terms" className="font-semibold cursor-pointer">
              구매 조건 및 결제 대행 서비스 약관 동의 (필수)
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              전자금융거래법에 의거하여 결제 대행 서비스 이용약관에 동의합니다
            </p>
          </div>
        </div>
        <Separator />
        <div className="flex items-start gap-3">
          <Checkbox
            id="refund"
            checked={agreedRefund}
            onCheckedChange={(checked) => setAgreedRefund(!!checked)}
          />
          <div className="flex-1">
            <Label htmlFor="refund" className="font-semibold cursor-pointer">
              취소 및 환불 규정 동의 (필수)
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              이벤트 7일 전까지 전액 환불, 3일 전까지 50% 환불 가능
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
