import { authApi } from '@/api/auth'
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
import type { LoginRequest } from '@/types/auth'
import { loginFormSchema } from '@/utils/validation'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const setAuth = useAuthStore((state) => state.setAuth)

  const loginMutation = useMutation({
    mutationFn: authApi.login,
  })

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      loginMutation.mutate(value as LoginRequest, {
        onSuccess: (response) => {
          setAuth(response.data.user, response.data.tokens)
          form.reset()
          toast.success('로그인되었습니다.')

          onOpenChange(false)
        },
        onError: (error) => {
          toast.error(error.message || '로그인에 실패했습니다.')
        },
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>로그인</DialogTitle>
          <DialogDescription>WaitFair에 로그인하여 티켓을 예매하세요</DialogDescription>
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
            name="email"
            validators={{
              onChange: ({ value }) => {
                const result = loginFormSchema.shape.email.safeParse(value)
                if (result.success) return undefined
                return result.error.issues[0]?.message
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
                disabled={loginMutation.isPending}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                const result = loginFormSchema.shape.password.safeParse(value)
                if (result.success) return undefined
                return result.error.issues[0]?.message
              },
            }}
          >
            {(field) => (
              <Input
                type="password"
                label="비밀번호"
                placeholder="비밀번호를 입력하세요"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(', ')}
                disabled={loginMutation.isPending}
              />
            )}
          </form.Field>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loginMutation.isPending}
            >
              취소
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!canSubmit || isSubmitting || loginMutation.isPending}
                >
                  {loginMutation.isPending || isSubmitting ? '로그인 중...' : '로그인'}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <button
            type="button"
            className="text-blue-600 hover:underline font-medium"
            onClick={() => {
              onOpenChange(false)
              window.dispatchEvent(new CustomEvent('openSignupModal'))
            }}
          >
            회원가입
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
