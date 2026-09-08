import type { CreditCard } from '@/features/cards/types/card.type'
import type { Installment } from '@/features/invoices/types/installment.type'
import type { Transaction } from '@/features/transactions/types/transaction.type'
import { removeTransactionUseCase } from '@/features/transactions/use-cases/transaction-remove.use-case'
import { createTransactionUseCase } from '@/features/transactions/use-cases/transaction-save.use-case'

import type { RecurrenceBill } from '../types/recurrence.type'

type PayContext = {
  cards: CreditCard[]
  installments: Installment[]
}

/**
 * Quitar é lançar. A data é a do vencimento da ocorrência, não a de hoje:
 * marcar em setembro a conta de março tem de pesar no mês de março, senão o
 * acerto de quem ficou meses fora reescreveria o mês em que ele voltou.
 */
export async function payRecurrenceBillUseCase(
  uid: string,
  bill: RecurrenceBill,
  amountCents: number,
  context: PayContext,
): Promise<Transaction> {
  const { recurrence } = bill

  return createTransactionUseCase(
    uid,
    {
      kind: recurrence.kind,
      description: recurrence.description,
      amountCents,
      categoryId: recurrence.categoryId,
      method: recurrence.method,
      cardId: recurrence.cardId,
      date: bill.dueDate,
      installments: 1,
      recurrenceId: recurrence.id,
    },
    context,
  )
}

export async function unpayRecurrenceBillUseCase(
  uid: string,
  bill: RecurrenceBill,
  installments: Installment[],
): Promise<void> {
  if (!bill.transactionId) return

  await removeTransactionUseCase(uid, bill.transactionId, installments)
}
