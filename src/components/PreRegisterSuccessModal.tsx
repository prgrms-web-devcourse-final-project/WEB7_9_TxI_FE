import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { CheckCircle } from 'lucide-react'

interface PreRegisterSuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PreRegisterSuccessModal({ open, onOpenChange }: PreRegisterSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <DialogTitle>사전 등록 완료</DialogTitle>
          </div>
        </DialogHeader>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700 text-center">
            사전 등록이 완료되었습니다. <br /> 티켓팅 시작일에 알림을 보내드리겠습니다.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button className="flex-1" onClick={() => onOpenChange(false)}>
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
