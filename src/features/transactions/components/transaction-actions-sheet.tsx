'use client'

import { useLedger } from '@/features/ledger/providers/ledger.provider'
import { BottomSheet } from '@/shared/components/bottom-sheet'
import { Button } from '@/shared/components/button'
import { formatMoney } from '@/shared/utils/money.util'

import type { Transaction } from '../types/transaction.type'
import { removeTransactionUseCase } from '../use-cases/transaction-remove.use-case'

type TransactionActionsSheetProps = {
  transaction: Transaction | null
  onClose: () => void
  onEdit: (transaction: Transaction) => void
}

export function TransactionActionsSheet({
  transaction,
  onClose,
  onEdit,
}: TransactionActionsSheetProps) {
  const { uid, installments, reload } = useLedger()

  const remove = async () => {
    if (!uid || !transaction) return

    await removeTransactionUseCase(uid, transaction.id, installments)
    await reload()
    onClose()
  }

  return (
    <BottomSheet
      open={transaction !== null}
      title={transaction?.description ?? ''}
      description={
        transaction ? formatMoney(transaction.amountCents) : undefined
      }
      onClose={onClose}
    >
      <div className="flex flex-col gap-2 pb-5">
        <Button
          variant="outline"
          onClick={() => {
            if (transaction) onEdit(transaction)
            onClose()
          }}
        >
          Editar lançamento
        </Button>
        <Button variant="danger" onClick={remove}>
          Excluir lançamento
        </Button>
      </div>
    </BottomSheet>
  )
}
