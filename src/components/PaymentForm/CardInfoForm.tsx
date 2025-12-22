import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export function CardInfoForm() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">카드 정보</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="cardNumber">카드번호</Label>
          <Input
            id="cardNumber"
            placeholder="0000-0000-0000-0000"
            className="mt-1.5"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiry">유효기간</Label>
            <Input id="expiry" placeholder="MM/YY" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="cvc">CVC</Label>
            <Input
              id="cvc"
              placeholder="123"
              type="password"
              maxLength={3}
              className="mt-1.5"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="cardPassword">카드 비밀번호</Label>
          <Input
            id="cardPassword"
            placeholder="앞 2자리"
            type="password"
            maxLength={2}
            className="mt-1.5"
          />
        </div>
      </div>
    </Card>
  )
}
