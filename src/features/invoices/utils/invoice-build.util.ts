import type { CreditCard } from '@/features/cards/types/card.type'
import { currentMonth, daysUntil } from '@/shared/utils/date.util'

import { INVOICE_DUE_SOON_DAYS } from '../constants/invoices.constants'
import type { Installment, Invoice } from '../types/installment.type'
import { invoiceDueDate } from './invoice-allocation.util'

export function buildInvoice(
  card: CreditCard,
  month: string,
  installments: Installment[],
): Invoice {
  const daFatura = installments
    .filter(
      (installment) =>
        installment.cardId === card.id && installment.invoiceMonth === month,
    )
    .sort(
      (first, second) =>
        first.purchaseDate.localeCompare(second.purchaseDate) ||
        first.number - second.number,
    )

  const totalCents = daFatura.reduce(
    (total, installment) => total + installment.amountCents,
    0,
  )

  const paidCents = daFatura
    .filter((installment) => installment.paid)
    .reduce((total, installment) => total + installment.amountCents, 0)

  return {
    cardId: card.id,
    month,
    dueDate: invoiceDueDate(month, card.dueDay),
    totalCents,
    paidCents,
    openCents: totalCents - paidCents,
    paid: daFatura.length > 0 && daFatura.every((entry) => entry.paid),
    installments: daFatura,
  }
}

export function listOpenInvoices(
  cards: CreditCard[],
  installments: Installment[],
): Invoice[] {
  const meses = new Set(
    installments
      .filter((installment) => !installment.paid)
      .map((installment) => `${installment.cardId}|${installment.invoiceMonth}`),
  )

  const atual = currentMonth()

  return [...meses]
    .map((chave) => {
      const [cardId, month] = chave.split('|')
      const card = cards.find((entry) => entry.id === cardId)

      return card ? buildInvoice(card, month, installments) : null
    })
    .filter((invoice): invoice is Invoice => invoice !== null)
    .filter((invoice) => invoice.openCents > 0 && invoice.month <= atual)
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate))
}

export function invoiceDueSoon(invoice: Invoice): boolean {
  const dias = daysUntil(invoice.dueDate)

  return dias >= 0 && dias <= INVOICE_DUE_SOON_DAYS
}

export function invoiceOverdue(invoice: Invoice): boolean {
  return daysUntil(invoice.dueDate) < 0 && invoice.openCents > 0
}
