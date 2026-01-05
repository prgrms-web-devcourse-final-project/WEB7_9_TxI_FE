import { authApi } from '@/api/auth'
import { userApi } from '@/api/user'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'
import type { SignupRequest } from '@/types/auth'
import { signupFormSchema } from '@/utils/validation'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { UserRole } from '../types/user'
import { formatBusinessNumber } from '../utils/format'
import kakaoBtnImg from '../../assets/kakao_login_medium_narrow.png'

const kakaoAuthUrl =
  (import.meta.env.VITE_KAKAO_AUTH_URL ?? 'http://localhost:8080/oauth2/authorization/kakao')
  + `?redirectUrl=${encodeURIComponent(window.location.origin + '/oauth/callback')}`

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenLoginChange: (open: boolean) => void
}

export function SignupModal({ open, onOpenChange, onOpenLoginChange }: Props) {
  const { setUser, setAccessToken } = useAuthStore()
  const queryClient = useQueryClient()
  const [accountType, setAccountType] = useState<UserRole>('NORMAL')

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
  })

  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      nickname: '',
      birthDate: '',
      password: '',
      passwordConfirm: '',
      businessNumber: '',
    },
    onSubmit: async ({ value }) => {
      if (accountType === 'ADMIN' && !value.businessNumber) {
        toast.error('사업자등록번호를 입력해주세요.')
        return
      }

      const [year, month, day] = value.birthDate.split('-')

      const signupData: SignupRequest = {
        email: value.email,
        password: value.password,
        fullName: value.fullName,
        nickname: value.nickname,
        role: accountType,
        year,
        month,
        day,
        ...(accountType === 'ADMIN' && value.businessNumber && { registrationNumber: value.businessNumber }),
      }

      signupMutation.mutate(signupData, {
        onSuccess: async () => {
          try {
            queryClient.clear()

            const loginResponse = await authApi.login({
              email: value.email,
              password: value.password,
            })
            setAccessToken(loginResponse.data.tokens.accessToken)

            const userResponse = await userApi.getUserProfile()
            setUser(userResponse.data)

            toast.success('회원가입이 완료되어 자동 로그인되었습니다.')
            form.reset()
            onOpenChange(false)

            if (accountType === 'ADMIN') {
              window.location.href = '/admin'
            } else {
              window.location.href = '/'
            }
          } catch {
            toast.error('수동으로 로그인해주세요')
            form.reset()
            onOpenChange(false)
            onOpenLoginChange(true)
          }
        },
        onError: (error: Error) => {
          toast.error(error.message)
        },
      })
    },
  })

  // 모달이 열릴 때마다 일반 사용자 탭으로 리셋
  useEffect(() => {
    if (open) {
      setAccountType('NORMAL')
      form.reset()
    }
  }, [open, form])

  const handleKakaoSignup = () => {
    window.location.href = kakaoAuthUrl
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>회원가입</DialogTitle>
          <DialogDescription>
            {accountType === 'NORMAL'
              ? 'WaitFair에 가입하여 티켓을 예매하세요'
              : 'WaitFair에 가입하여 이벤트를 공정하고 효율적으로 운영하세요'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex border-b border-border mb-6 mt-4 bg-gray-50 rounded-t-lg overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setAccountType('NORMAL')
              form.reset()
            }}
            className={`flex-1 py-3.5 text-center font-semibold transition-all relative ${
              accountType === 'NORMAL'
                ? 'text-primary bg-white shadow-sm border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            일반사용자
          </button>
          <button
            type="button"
            onClick={() => {
              setAccountType('ADMIN')
              form.reset()
            }}
            className={`flex-1 py-3.5 text-center font-semibold transition-all relative ${
              accountType === 'ADMIN'
                ? 'text-primary bg-white shadow-sm border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            상점관리자
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="fullName"
            validators={{
              onChange: ({ value }) => {
                const result = signupFormSchema.shape.fullName.safeParse(value)
                return result.success ? undefined : result.error.issues[0]?.message
              },
            }}
          >
            {(field) => (
              <Input
                label="이름"
                placeholder="홍길동"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(', ')}
                disabled={signupMutation.isPending}
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                const result = signupFormSchema.shape.email.safeParse(value)
                return result.success ? undefined : result.error.issues[0]?.message
              },
            }}
          >
            {(field) => (
              <Input
                type="email"
                label="이메일"
                placeholder="example@email.com"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(', ')}
                disabled={signupMutation.isPending}
              />
            )}
          </form.Field>

          <form.Field
            name="nickname"
            validators={{
              onChange: ({ value }) => {
                const result = signupFormSchema.shape.nickname.safeParse(value)
                return result.success ? undefined : result.error.issues[0]?.message
              },
            }}
          >
            {(field) => (
              <Input
                label="닉네임"
                placeholder="3~10자"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(', ')}
                disabled={signupMutation.isPending}
              />
            )}
          </form.Field>

          <form.Field
            name="birthDate"
            validators={{
              onChange: ({ value }) => {
                const result = signupFormSchema.shape.birthDate.safeParse(value)
                return result.success ? undefined : result.error.issues[0]?.message
              },
            }}
          >
            {(field) => (
              <Input
                type="date"
                label="생년월일"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(', ')}
                disabled={signupMutation.isPending}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                const result = signupFormSchema.shape.password.safeParse(value)
                return result.success ? undefined : result.error.issues[0]?.message
              },
            }}
          >
            {(field) => (
              <Input
                type="password"
                label="비밀번호"
                placeholder="영어+숫자 포함, 8~30자"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(', ')}
                disabled={signupMutation.isPending}
              />
            )}
          </form.Field>

          <form.Field
            name="passwordConfirm"
            validators={{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) => {
                const password = fieldApi.form.getFieldValue('password')
                if (!value) {
                  return '비밀번호 확인을 입력해주세요.'
                }
                if (password !== value) {
                  return '비밀번호가 일치하지 않습니다.'
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <Input
                type="password"
                label="비밀번호 확인"
                placeholder="비밀번호를 다시 입력하세요"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(', ')}
                disabled={signupMutation.isPending}
              />
            )}
          </form.Field>

          {accountType === 'ADMIN' && (
            <form.Field
              name="businessNumber"
              validators={{
                onChange: ({ value }) => {
                  if (!value) {
                    return '사업자등록번호를 입력해주세요.'
                  }
                  const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/
                  if (!businessNumberRegex.test(value)) {
                    return '사업자등록번호 형식이 올바르지 않습니다. (예: 000-00-00000)'
                  }
                  return undefined
                },
              }}
            >
              {(field) => (
                <Input
                  type="text"
                  label="사업자등록번호"
                  placeholder="000-00-00000"
                  value={field.state.value}
                  onChange={(e) => {
                    const formatted = formatBusinessNumber(e.target.value)
                    field.handleChange(formatted)
                  }}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.join(', ')}
                  disabled={signupMutation.isPending}
                />
              )}
            </form.Field>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={signupMutation.isPending}
            >
              취소
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!canSubmit || isSubmitting || signupMutation.isPending}
                >
                  {signupMutation.isPending || isSubmitting ? '가입 중...' : '회원가입'}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>

        {
          accountType === 'NORMAL' && (
            <>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  또는
                </span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>
              <button
                type="button"
                onClick={handleKakaoSignup}
                className="mt-6 w-full rounded-2xl overflow-hidden"
              >
                <img
                  src={kakaoBtnImg}
                  alt="카카오 로그인"
                  className="w-full h-[48px] object-contain"
                />
              </button>
            </>
          )
        }

        <div className="mt-4 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?
          <button
            type="button"
            className="text-blue-600 hover:underline font-medium cursor-pointer ml-1"
            onClick={() => {
              onOpenChange(false)
              onOpenLoginChange(true)
            }}
          >
            로그인
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
