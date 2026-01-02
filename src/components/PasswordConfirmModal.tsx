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
import { passwordConfirmFormSchema } from '@/utils/validation'
import { useForm } from '@tanstack/react-form'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (password: string) => void
  title?: string
  description?: string
  isLoading?: boolean
}

export function PasswordConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  title = '비밀번호 확인',
  description = '본인 확인을 위해 비밀번호를 입력해주세요.',
  isLoading = false,
}: Props) {
  const form = useForm({
    defaultValues: {
      password: '',
    },
    onSubmit: async ({ value }) => {
      onConfirm(value.password)
      form.reset()
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
            name="password"
            validators={{
              onChange: ({ value }) => {
                const result = passwordConfirmFormSchema.shape.password.safeParse(value)
                return result.success ? undefined : result.error.issues[0]?.message
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
                disabled={isLoading}
              />
            )}
          </form.Field>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!canSubmit || isSubmitting || isLoading}
                >
                  {isLoading || isSubmitting ? '확인 중...' : '확인'}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
