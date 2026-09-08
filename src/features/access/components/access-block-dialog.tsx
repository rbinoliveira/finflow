'use client'

import { Button } from '@/shared/components/button'
import { Dialog } from '@/shared/components/dialog'

import {
  BLOCK_CONFIRM_ACTION,
  BLOCK_CONFIRM_CANCEL,
  BLOCK_CONFIRM_TITLE,
} from '../constants/access.constants'

type AccessBlockDialogProps = {
  email: string | null
  onClose: () => void
  onConfirm: () => void
}

export function AccessBlockDialog({
  email,
  onClose,
  onConfirm,
}: AccessBlockDialogProps) {
  return (
    <Dialog
      open={Boolean(email)}
      title={BLOCK_CONFIRM_TITLE}
      description={
        email
          ? `${email} deixa de abrir o app na próxima vez. Os lançamentos dessa pessoa não são apagados.`
          : undefined
      }
      onClose={onClose}
    >
      <div className="mt-5 flex gap-2.5">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          {BLOCK_CONFIRM_CANCEL}
        </Button>
        <Button variant="danger" className="flex-1" onClick={onConfirm}>
          {BLOCK_CONFIRM_ACTION}
        </Button>
      </div>
    </Dialog>
  )
}
