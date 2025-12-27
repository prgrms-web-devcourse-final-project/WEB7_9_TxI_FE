import { authApi } from '@/api/auth'
import { userApi } from '@/api/user'
import { ConfirmModal } from '@/components/ConfirmModal'
import { PasswordConfirmModal } from '@/components/PasswordConfirmModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuthStore } from '@/stores/authStore'
import type { UpdateUserRequest } from '@/types/user'
import { updateUserFormSchema } from '@/utils/validation'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Calendar, Mail, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

export default function MyPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { clearUser, updateUser } = useAuthStore()

  const [isEditing, setIsEditing] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false)

  const { data: userData } = useSuspenseQuery({
    queryKey: ['user', 'me'],
    queryFn: userApi.getUserProfile,
  })

  const defaultFormValues = useMemo(
    () => ({
      fullName: userData.data.fullName,
      nickname: userData.data.nickname,
      birthDate: userData.data.birthDate,
    }),
    [userData],
  )

  const verifyPasswordMutation = useMutation({
    mutationFn: authApi.verifyPassword,
    onSuccess: () => {
      setIsPasswordModalOpen(false)
      form.setFieldValue('fullName', userData.data.fullName)
      form.setFieldValue('nickname', userData.data.nickname)
      form.setFieldValue('birthDate', userData.data.birthDate)
      setIsEditing(true)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: userApi.updateUserProfile,
    onSuccess: ({ data }) => {
      updateUser(data)
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success('정보가 수정되었습니다.')
      setIsEditing(false)
      form.setFieldValue('fullName', data.fullName)
      form.setFieldValue('nickname', data.nickname)
      form.setFieldValue('birthDate', data.birthDate)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const form = useForm({
    defaultValues: defaultFormValues,
    onSubmit: async ({ value }) => {
      const [year, month, day] = value.birthDate.split('-')

      const updateData: UpdateUserRequest = {
        fullName: value.fullName,
        nickname: value.nickname,
        year,
        month,
        day,
      }
      updateMutation.mutate(updateData)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      toast.success('회원 탈퇴가 완료되었습니다.')
      clearUser()
      navigate({ to: '/' })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handlePasswordConfirm = (password: string) => {
    verifyPasswordMutation.mutate({ password })
  }

  const handleCancelEdit = () => {
    form.setFieldValue('fullName', userData.data.fullName)
    form.setFieldValue('nickname', userData.data.nickname)
    form.setFieldValue('birthDate', userData.data.birthDate)
    setIsEditing(false)
  }

  const handleDeleteClick = () => {
    setIsDeleteConfirmModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    deleteMutation.mutate()
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{userData.data.fullName}</h2>
              <p className="text-gray-600">{userData.data.fullName}</p>
            </div>
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>이름</Label>
                <Input value={userData.data.fullName} disabled />
              </div>

              <div className="space-y-2">
                <Label>이메일</Label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <Input value={userData.data.email} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>닉네임</Label>
                <Input value={userData.data.nickname} disabled />
              </div>

              <div className="space-y-2">
                <Label>생년월일</Label>
                <Input value={userData.data.birthDate} disabled />
              </div>

              <div className="space-y-2">
                <Label>가입일</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <Input value={dayjs(userData.data.signupDate).format('YYYY-MM-DD')} disabled />
                </div>
              </div>
            </div>
          ) : (
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
                    const result = updateUserFormSchema.shape.fullName.safeParse(value)
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
                    disabled={updateMutation.isPending}
                  />
                )}
              </form.Field>

              <div className="space-y-2">
                <Label>이메일</Label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <Input value={userData.data.email} disabled />
                </div>
              </div>

              <form.Field
                name="nickname"
                validators={{
                  onChange: ({ value }) => {
                    const result = updateUserFormSchema.shape.nickname.safeParse(value)
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
                    disabled={updateMutation.isPending}
                  />
                )}
              </form.Field>

              <form.Field
                name="birthDate"
                validators={{
                  onChange: ({ value }) => {
                    const result = updateUserFormSchema.shape.birthDate.safeParse(value)
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
                    disabled={updateMutation.isPending}
                  />
                )}
              </form.Field>

              <div className="space-y-2">
                <Label>가입일</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <Input value={dayjs(userData.data.signupDate).format('YYYY-MM-DD')} disabled />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelEdit}
                  disabled={updateMutation.isPending}
                >
                  취소
                </Button>
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={!canSubmit || isSubmitting || updateMutation.isPending}
                    >
                      {updateMutation.isPending || isSubmitting ? '수정 중...' : '저장'}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">계정 설정</h3>
          <div className="space-y-3">
            {!isEditing ? (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                내 정보 수정
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  const el = document.querySelector('form') as HTMLFormElement | null
                  el?.requestSubmit()
                }}
              >
                저장
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full justify-start text-red-600"
              onClick={handleDeleteClick}
              disabled={updateMutation.isPending || deleteMutation.isPending}
            >
              회원 탈퇴
            </Button>
          </div>
        </Card>
      </main>

      <PasswordConfirmModal
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        onConfirm={handlePasswordConfirm}
        title="비밀번호 확인"
        description="정보 수정을 위해 비밀번호를 입력해주세요."
        isLoading={verifyPasswordMutation.isPending}
      />

      <ConfirmModal
        open={isDeleteConfirmModalOpen}
        onOpenChange={setIsDeleteConfirmModalOpen}
        onConfirm={handleDeleteConfirm}
        title="회원 탈퇴"
        description="정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="탈퇴"
        cancelText="취소"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
