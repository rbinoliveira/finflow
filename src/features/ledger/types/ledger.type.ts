import type { CreditCard } from '@/features/cards/types/card.type'
import type { Category } from '@/features/categories/types/category.type'
import type { Installment } from '@/features/invoices/types/installment.type'
import type { Recurrence } from '@/features/recurrences/types/recurrence.type'
import type { Transaction } from '@/features/transactions/types/transaction.type'

export type LedgerData = {
  categories: Category[]
  cards: CreditCard[]
  transactions: Transaction[]
  installments: Installment[]
  recurrences: Recurrence[]
}

export type MonthSummary = {
  incomeCents: number
  expenseCents: number
  balanceCents: number
}

/** Uma fatia do gasto do mês — serve tanto para categoria quanto para forma de
 *  pagamento, porque a tela desenha as duas do mesmo jeito. */
export type SpendingSlice = {
  id: string
  name: string
  color: string
  emoji: string
  totalCents: number
  percent: number
}
