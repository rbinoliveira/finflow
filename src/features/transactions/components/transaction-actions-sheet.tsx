'use client'

import { useLedger } from '@/features/ledger/providers/ledger.provider'
import { BottomSheet } from '@/shared/components/bottom-sheet'
import { Button } from '@/shared/components/button'
import { formatMoney } from '@/shared/utils/money.util'

import { useTransactionComposer } from '../providers/transaction-composer.provider'
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
  const { uid, installments, recurrences, reload } = useLedger()
  const { editRecurrence } = useTransactionComposer()

  const recurrence = transaction?.recurrenceId
    ? (recurrences.find((entry) => entry.id === transaction.recurrenceId) ??
      null)
    : null

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
        {/* O lançamento é o pagamento de um mês; valor, dia e repetição dos
            próximos moram na regra. Uma regra já excluída não tem o que abrir. */}
        {recurrence && (
          <Button
            variant="outline"
            onClick={() => {
              editRecurrence(recurrence)
              onClose()
            }}
          >
            Editar recorrência
          </Button>
        )}
        <Button variant="danger" onClick={remove}>
          Excluir lançamento
        </Button>
      </div>
    </BottomSheet>
  )
}
