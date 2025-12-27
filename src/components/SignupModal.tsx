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
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenLoginChange: (open: boolean) => void
}

export function SignupModal({ open, onOpenChange, onOpenLoginChange }: Props) {
  const { setUser, setAccessToken } = useAuthStore()
  const queryClient = useQueryClient()

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
    },
    onSubmit: async ({ value }) => {
      const [year, month, day] = value.birthDate.split('-')

      const signupData: SignupRequest = {
        email: value.email,
        password: value.password,
        fullName: value.fullName,
        nickname: value.nickname,
        year,
        month,
        day,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>회원가입</DialogTitle>
          <DialogDescription>WaitFair에 가입하여 티켓을 예매하세요</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4 mt-4"
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
