import type { CreditCard } from '@/features/cards/types/card.type'
import type { Category } from '@/features/categories/types/category.type'
import type { Installment } from '@/features/invoices/types/installment.type'
import type { Transaction } from '@/features/transactions/types/transaction.type'

export type LedgerData = {
  categories: Category[]
  cards: CreditCard[]
  transactions: Transaction[]
  installments: Installment[]
}

export type MonthSummary = {
  incomeCents: number
  expenseCents: number
  balanceCents: number
}

export type CategorySpending = {
  categoryId: string | null
  name: string
  color: string
  emoji: string
  totalCents: number
  percent: number
}
