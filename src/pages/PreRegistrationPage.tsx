import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, Shield } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { eventsApi } from '@/api/events'
import { smsApi } from '@/api/sms'
import { useQueryClient } from '@tanstack/react-query'

export default function PreRegistrationPage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/events/$id/register' })
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    fullname: '',
    phoneNumber: '',
    verificationCode: '',
    birthDate: '',
    agreeTerms: false,
    agreePrivacy: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingSms, setIsSendingSms] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [showVerificationInput, setShowVerificationInput] = useState(false)

  // SMS 인증번호 발송
  const handleSendSms = async () => {
    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      toast.error('올바른 휴대폰 번호를 입력해주세요.')
      return
    }

    setIsSendingSms(true)

    try {
      await smsApi.sendVerificationCode(formData.phoneNumber)
      toast.success('인증번호가 발송되었습니다.')
      setShowVerificationInput(true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '인증번호 발송에 실패했습니다.'
      toast.error(errorMessage)
    } finally {
      setIsSendingSms(false)
    }
  }

  // SMS 인증번호 확인
  const handleVerifySms = async () => {
    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      toast.error('6자리 인증번호를 입력해주세요.')
      return
    }

    setIsVerifying(true)

    try {
      await smsApi.verifyCode(formData.phoneNumber, formData.verificationCode)
      toast.success('본인 인증이 완료되었습니다.')
      setIsVerified(true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '인증번호가 일치하지 않습니다.'
      toast.error(errorMessage)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!formData.fullname || formData.fullname.length < 2) {
      toast.error('이름을 입력해주세요.')
      return
    }

    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      toast.error('올바른 휴대폰 번호를 입력해주세요.')
      return
    }

    if (!isVerified) {
      toast.error('휴대폰 본인 인증을 완료해주세요.')
      return
    }

    if (!formData.birthDate) {
      toast.error('생년월일을 입력해주세요.')
      return
    }

    if (!formData.agreeTerms || !formData.agreePrivacy) {
      toast.error('모든 약관에 동의해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      console.log('reCAPTCHA 토큰 발급 중...')

      const response = await eventsApi.createPreRegister(id, {
        fullName: formData.fullname,
        phoneNumber: formData.phoneNumber,
        birthDate: formData.birthDate,
        agreeTerms: formData.agreeTerms,
        agreePrivacy: formData.agreePrivacy,
      })

      console.log('사전등록 성공:', response)

      localStorage.setItem(`preRegistered_${id}`, 'true')

      queryClient.invalidateQueries({ queryKey: ['event', id, 'pre-register-status'] })
      queryClient.invalidateQueries({ queryKey: ['event', id, 'pre-register-count'] })

      toast.success('사전등록 완료! 티켓팅 시작일에 대기열에 입장하실 수 있습니다.')

      navigate({ to: `/events/${id}` })
    } catch (error) {
      console.error('사전등록 실패:', error)

      const errorMessage = error instanceof Error ? error.message : '사전등록에 실패했습니다.'

      if (errorMessage.includes('reCAPTCHA') || errorMessage.includes('보안 검증')) {
        toast.error('보안 검증에 실패했습니다. 페이지를 새로고침 후 다시 시도해주세요.')
      } else if (errorMessage.includes('봇으로 의심')) {
        toast.error('보안 검증에 실패했습니다. 잠시 후 다시 시도해주세요.')
      } else if (errorMessage.includes('이미')) {
        toast.error('이미 사전등록하셨습니다.')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
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
            {/* 이름 */}
            <div className="space-y-2">
              <Label htmlFor="fullname">이름 *</Label>
              <Input
                id="fullname"
                type="text"
                placeholder="회원정보의 이름을 입력해주세요"
                required
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              />
              <p className="text-xs text-gray-600">회원가입 시 등록한 이름과 일치하는지 확인해주세요</p>
            </div>

            {/* 휴대폰 번호 */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">휴대폰 번호 *</Label>
              <div className="flex gap-2">
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="01012345678"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, phoneNumber: e.target.value.replace(/[^0-9]/g, '') })
                    // 휴대폰 번호 변경 시 인증 상태 초기화
                    if (isVerified) {
                      setIsVerified(false)
                      setShowVerificationInput(false)
                      setFormData((prev) => ({ ...prev, verificationCode: '' }))
                    }
                  }}
                  maxLength={11}
                  disabled={isVerified}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleSendSms}
                  disabled={isSendingSms || isVerified || !formData.phoneNumber}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  {isSendingSms ? '발송 중...' : isVerified ? '인증완료' : '인증'}
                </Button>
              </div>
              <p className="text-xs text-gray-600">"-"하이픈을 제외하여 입력해주세요</p>
            </div>

            {/* 인증번호 입력 (SMS 발송 후 표시) */}
            {showVerificationInput && !isVerified && (
              <div className="space-y-2">
                <Label htmlFor="verificationCode">인증번호 *</Label>
                <div className="flex gap-2">
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="123456"
                    required
                    value={formData.verificationCode}
                    onChange={(e) =>
                      setFormData({ ...formData, verificationCode: e.target.value.replace(/[^0-9]/g, '') })
                    }
                    maxLength={6}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleVerifySms}
                    disabled={isVerifying || !formData.verificationCode}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    {isVerifying ? '확인 중...' : '확인'}
                  </Button>
                </div>
                <p className="text-xs text-gray-600">발송된 6자리 인증번호를 입력해주세요</p>
              </div>
            )}

            {/* 인증 완료 메시지 */}
            {isVerified && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  본인 인증이 완료되었습니다
                </p>
              </div>
            )}

            {/* 생년월일 */}
            <div className="space-y-2">
              <Label htmlFor="birthDate">생년월일 *</Label>
              <Input
                id="birthDate"
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                placeholder="연도-월-일"
              />
              <p className="text-xs text-gray-600">회원가입 시 등록한 생년월일을 입력해주세요</p>
            </div>

            {/* 약관 동의 */}
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
