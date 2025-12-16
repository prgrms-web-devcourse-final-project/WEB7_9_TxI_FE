import { addNotification } from '@/components/NotificationDropdown'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, Shield, Ticket } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function PreRegistrationPage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/events/$id/register' })

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    birthdate: '',
    agreeTerms: false,
    agreePrivacy: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!formData.password || formData.password.length < 6) {
      toast.error('비밀번호는 6자리 이상이어야 합니다.')
      return
    }

    if (!formData.agreeTerms || !formData.agreePrivacy) {
      toast.error('모든 약관에 동의해주세요.')
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      localStorage.setItem(`preRegistered_${id}`, 'true')

      addNotification({
        type: 'registration',
        title: '사전등록 완료',
        message: '사전등록이 완료되었습니다. 티켓팅 시작일에 알림을 보내드리겠습니다.',
        timestamp: new Date().toLocaleString('ko-KR'),
      })

      toast.success('사전등록 완료! 티켓팅 시작일에 대기열에 입장하실 수 있습니다.')
      navigate({ to: `/events/${id}` })
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">WaitFair</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          to="/events/$id"
          params={{ id }}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          이벤트로 돌아가기
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">사전 등록</h1>
          <p className="text-gray-600">본인 인증 후 공정한 랜덤 큐에 참여하세요</p>
        </div>

        <Card className="p-6 mb-6 border-blue-600/30 bg-blue-600/5">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            사전 등록 혜택
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>새벽 접속 경쟁 없이 원하는 시간에 등록</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>등록 시점과 관계없이 공정한 랜덤 큐 배정</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>티켓팅 시작 시 알림 전송</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호 *</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호 (6자리 이상)"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <p className="text-xs text-gray-600">본인 인증을 위해 사용됩니다</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate">생년월일 *</Label>
              <Input
                id="birthdate"
                type="date"
                required
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked })}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                  이용약관에 동의합니다 (필수)
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="privacy"
                  checked={formData.agreePrivacy}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreePrivacy: checked })}
                />
                <Label htmlFor="privacy" className="text-sm cursor-pointer leading-relaxed">
                  개인정보 수집 및 이용에 동의합니다 (필수)
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '사전 등록 완료하기'}
            </Button>
          </form>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>1인 1계정만 등록 가능하며, 중복 등록 시 자동으로 차단됩니다.</p>
        </div>
      </main>
    </div>
  )
}
