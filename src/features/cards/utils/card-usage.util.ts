import type { Installment } from '@/features/invoices/types/installment.type'

import type { CardUsage, CreditCard } from '../types/card.type'

export function buildCardUsage(
  card: CreditCard,
  installments: Installment[],
): CardUsage {
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
    usedPercent:
      card.limitCents > 0 ? (usedCents / card.limitCents) * 100 : 0,
    openInvoiceCents: usedCents,
  }
}
