'use client'

import { useLedger } from '@/features/ledger/providers/ledger.provider'
import { Button } from '@/shared/components/button'
import { Dialog } from '@/shared/components/dialog'

import type { Recurrence } from '../types/recurrence.type'
import { removeRecurrenceUseCase } from '../use-cases/recurrence-remove.use-case'

type RecurrenceRemoveDialogProps = {
  recurrence: Recurrence | null
  onClose: () => void
}

export function RecurrenceRemoveDialog({
  recurrence,
  onClose,
}: RecurrenceRemoveDialogProps) {
  const { uid, transactions, reload } = useLedger()

  const lancadas = recurrence
    ? transactions.filter(
        (transaction) => transaction.recurrenceId === recurrence.id,
      ).length
    : 0

  const remove = async () => {
    if (!uid || !recurrence) return

    await removeRecurrenceUseCase(uid, recurrence.id)
    await reload()
    onClose()
  }

  return (
    <Dialog
      open={recurrence !== null}
      title="Remover recorrência"
      description={
        lancadas > 0
          ? `A série para de gerar novos lançamentos. Os ${lancadas} que já nasceram dela continuam no histórico.`
          : 'A série para de gerar novos lançamentos.'
      }
      onClose={onClose}
    >
      <div className="mt-5 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="danger" className="flex-1" onClick={remove}>
          Remover
        </Button>
      </div>
    </Dialog>
  )
}
