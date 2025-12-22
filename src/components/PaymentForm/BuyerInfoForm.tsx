import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export function BuyerInfoForm() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">구매자 정보</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">이름</Label>
          <Input
            id="name"
            placeholder="홍길동"
            defaultValue="홍길동"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="phone">휴대폰 번호</Label>
          <Input
            id="phone"
            placeholder="010-0000-0000"
            defaultValue="010-1234-5678"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            defaultValue="test@waitfair.com"
            className="mt-1.5"
          />
        </div>
      </div>
    </Card>
  )
}
