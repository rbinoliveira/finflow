import { dayInMonthIso, monthOf, shiftMonth } from '@/shared/utils/date.util'

import { INVOICE_CHOICE_COUNT } from '../constants/invoices.constants'

/**
 * A fatura de destino é identificada pelo mês em que ela vence.
 *
 * Compra feita a partir do dia de fechamento já entra na fatura seguinte. E
 * quando o vencimento cai antes do fechamento, a fatura que fecha num mês só
 * vence no mês seguinte — por isso o deslocamento extra.
 */
export function resolveInvoiceMonth(
  purchaseDate: string,
  closingDay: number,
  dueDay: number,
): string {
  const purchaseDay = Number(purchaseDate.slice(8, 10))
  const closesNextMonth = purchaseDay >= closingDay
  const duesAfterClosing = dueDay > closingDay ? 0 : 1

  return shiftMonth(
    monthOf(purchaseDate),
    (closesNextMonth ? 1 : 0) + duesAfterClosing,
  )
}

export function invoiceDueDate(invoiceMonth: string, dueDay: number): string {
  return dayInMonthIso(invoiceMonth, dueDay)
}

/**
 * As faturas que uma compra pode alcançar: a que a data indica e as seguintes.
 * Comprar na véspera do fechamento joga o gasto numa fatura que vence em
 * poucos dias — poder empurrar para a próxima é a diferença entre o app
 * descrever o cartão e discutir com ele.
 */
export function invoiceMonthChoices(
  purchaseDate: string,
  closingDay: number,
  dueDay: number,
  count: number = INVOICE_CHOICE_COUNT,
): string[] {
  const primeira = resolveInvoiceMonth(purchaseDate, closingDay, dueDay)

  return Array.from({ length: count }, (unused, index) =>
    shiftMonth(primeira, index),
  )
}
