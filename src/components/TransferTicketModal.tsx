import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ticketsApi } from '@/api/tickets'
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
import { ConfirmModal } from '@/components/ConfirmModal'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketId: number
  eventTitle: string
}

export function TransferTicketModal({ open, onOpenChange, ticketId, eventTitle }: Props) {
  const [targetNickname, setTargetNickname] = useState('')
  const [nicknameError, setNicknameError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const queryClient = useQueryClient()

  const transferMutation = useMutation({
    mutationFn: () => ticketsApi.transferTicket(ticketId, targetNickname),
    onSuccess: () => {
      toast.success('티켓 양도가 완료되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['myTickets'] })
      handleClose()
    },
    onError: (error: Error) => {
      toast.error(error.message || '티켓 양도에 실패했습니다.')
    },
  })

  const handleClose = () => {
    setTargetNickname('')
    setNicknameError('')
    setShowConfirm(false)
    onOpenChange(false)
  }

  const validateNickname = (): boolean => {
    if (!targetNickname.trim()) {
      setNicknameError('양도 대상 닉네임을 입력해주세요.')
      return false
    }
    if (targetNickname.length > 20) {
      setNicknameError('닉네임은 20자 이하여야 합니다.')
      return false
    }
    setNicknameError('')
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateNickname()) {
      setShowConfirm(true)
    }
  }

  const handleConfirmTransfer = () => {
    transferMutation.mutate()
  }

  return (
    <>
      <Dialog open={open && !showConfirm} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogClose onClose={handleClose} />
          <DialogHeader>
            <DialogTitle>티켓 양도</DialogTitle>
            <DialogDescription>
              "{eventTitle}" 티켓을 양도할 대상의 닉네임을 입력해주세요.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <Input
              label="양도 대상 닉네임"
              placeholder="닉네임을 입력하세요"
              value={targetNickname}
              onChange={(e) => {
                setTargetNickname(e.target.value)
                if (nicknameError) setNicknameError('')
              }}
              error={nicknameError}
              maxLength={20}
            />

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">
                양도하기
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                취소
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleConfirmTransfer}
        title="티켓 양도 확인"
        description={`"${targetNickname}" 님에게 "${eventTitle}" 티켓을 양도하시겠습니까? 양도 후에는 취소할 수 없습니다.`}
        confirmText="양도하기"
        cancelText="취소"
        variant="danger"
        isLoading={transferMutation.isPending}
      />
    </>
  )
}
