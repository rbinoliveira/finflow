import type { Installment } from '@/features/invoices/types/installment.type'
import type { Transaction } from '@/features/transactions/types/transaction.type'

import type { CardUsage, CreditCard } from '../types/card.type'

/**
 * O cartão de alimentação não tem fatura para consultar: o que ele gastou são
 * as próprias despesas lançadas nele. Contam as de `balanceSince` para cá —
 * o saldo informado é de uma data, e o que veio antes dela já estava
 * descontado quando a pessoa olhou o app do cartão.
 */
function mealUsage(card: CreditCard, transactions: Transaction[]): CardUsage {
  const usedCents = transactions
    .filter(
      (transaction) =>
        transaction.cardId === card.id &&
        transaction.kind === 'expense' &&
        transaction.date >= card.balanceSince,
    )
    .reduce((total, transaction) => total + transaction.amountCents, 0)

  /* Sem piso em zero: gastar mais do que havia é exatamente o que a pessoa
     precisa ver, e um saldo preso em zero esconderia o estouro. */
  return {
    card,
    usedCents,
    availableCents: card.balanceCents - usedCents,
    usedPercent:
      card.balanceCents > 0 ? (usedCents / card.balanceCents) * 100 : 0,
    openInvoiceCents: 0,
  }
}

export function buildCardUsage(
  card: CreditCard,
  installments: Installment[],
  transactions: Transaction[] = [],
): CardUsage {
  if (card.kind === 'meal') return mealUsage(card, transactions)

  const doCartao = installments.filter(
    (installment) => installment.cardId === card.id,
  )

  const usedCents = doCartao
    .filter((installment) => !installment.paid)
    .reduce((total, installment) => total + installment.amountCents, 0)

  const availableCents = Math.max(0, card.limitCents - usedCents)

  return {
    card,
    usedCents,
    availableCents,
    usedPercent: card.limitCents > 0 ? (usedCents / card.limitCents) * 100 : 0,
    openInvoiceCents: usedCents,
  }
}
