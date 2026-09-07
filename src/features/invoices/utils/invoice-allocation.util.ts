import { dayInMonthIso, monthOf, shiftMonth } from '@/shared/utils/date.util'

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
