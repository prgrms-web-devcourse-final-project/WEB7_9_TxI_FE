import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

interface DialogContentProps {
  children: ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: ReactNode
}

interface DialogTitleProps {
  children: ReactNode
}

interface DialogDescriptionProps {
  children: ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      {children}
    </div>
  )
}

export function DialogContent({ children, className = '' }: DialogContentProps) {
  return (
    <div
      className={`relative z-50 w-full max-w-md bg-white rounded-lg shadow-xl p-6 mx-auto ${className}`}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  )
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="mb-4">{children}</div>
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="text-xl font-bold text-gray-900">{children}</h2>
}

export function DialogDescription({ children }: DialogDescriptionProps) {
  return <p className="text-sm text-gray-600 mt-1">{children}</p>
}

export function DialogClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
    >
      <X className="h-4 w-4" />
      <span className="sr-only">닫기</span>
    </button>
  )
}
