import { Card } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Building2, CreditCard, Shield, Smartphone } from 'lucide-react'

interface PaymentMethodsProps {
  value: string
  onValueChange: (value: string) => void
}

export function PaymentMethods({ value, onValueChange }: PaymentMethodsProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold">결제 수단</h2>
      </div>
      <RadioGroup value={value} onValueChange={onValueChange} className="space-y-3">
        <label className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all border-blue-600 bg-blue-50">
          <RadioGroupItem value="card" id="card" />
          <CreditCard className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <Label htmlFor="card" className="font-semibold cursor-pointer">
              신용/체크카드
            </Label>
            <div className="text-sm text-gray-600">국내 모든 카드 사용 가능</div>
          </div>
        </label>
        <label className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all border-gray-300 hover:border-blue-300 hover:bg-gray-50">
          <RadioGroupItem value="mobile" id="mobile" />
          <Smartphone className="w-5 h-5" />
          <div className="flex-1">
            <Label htmlFor="mobile" className="font-semibold cursor-pointer">
              휴대폰 결제
            </Label>
            <div className="text-sm text-gray-600">통신사 소액결제</div>
          </div>
        </label>
        <label className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all border-gray-300 hover:border-blue-300 hover:bg-gray-50">
          <RadioGroupItem value="bank" id="bank" />
          <Building2 className="w-5 h-5" />
          <div className="flex-1">
            <Label htmlFor="bank" className="font-semibold cursor-pointer">
              계좌이체
            </Label>
            <div className="text-sm text-gray-600">실시간 계좌이체</div>
          </div>
        </label>
      </RadioGroup>
    </Card>
  )
}
