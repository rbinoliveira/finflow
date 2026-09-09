import type { CreditCard } from '@/features/cards/types/card.type'
import { createLocalId } from '@/features/offline/utils/local-id.util'
import type { Transaction } from '@/features/transactions/types/transaction.type'
import { monthOf, shiftMonth } from '@/shared/utils/date.util'
import { splitCents } from '@/shared/utils/money.util'

import type { Installment } from '../types/installment.type'
import {
  invoiceDueDate,
  resolveInvoiceMonth,
} from '../utils/invoice-allocation.util'

export function buildInstallmentsUseCase(
  transaction: Transaction,
  card: CreditCard,
): Installment[] {
  const total = Math.max(1, transaction.installments)
  const parcelas = splitCents(transaction.amountCents, total)
  /* Escolher a data do pagamento é escolher a fatura: o mês dela diz em qual a
     compra caiu, e o dia vale para todas as parcelas. Sem escolha, quem decide
     é o fechamento do cartão sobre a data da compra. */
  const primeiraFatura = transaction.paymentDate
    ? monthOf(transaction.paymentDate)
    : resolveInvoiceMonth(transaction.date, card.closingDay, card.dueDay)

  const diaPagamento = transaction.paymentDate
    ? Number(transaction.paymentDate.slice(8, 10))
    : card.dueDay
  const now = Date.now()

  return parcelas.map<Installment>((amountCents, index) => {
    const invoiceMonth = shiftMonth(primeiraFatura, index)

    return {
      id: createLocalId(),
      transactionId: transaction.id,
      cardId: card.id,
      number: index + 1,
      total,
      amountCents,
      description: transaction.description,
      categoryId: transaction.categoryId,
      purchaseDate: transaction.date,
      dueDate: invoiceDueDate(invoiceMonth, diaPagamento),
      invoiceMonth,
      paid: false,
      paidAt: null,
      createdAt: now + index,
      updatedAt: now + index,
    }
  })
}
