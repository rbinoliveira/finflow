import type { Category } from '@/features/categories/types/category.type'
import type { Transaction } from '@/features/transactions/types/transaction.type'
import { monthOf } from '@/shared/utils/date.util'

import type { CategorySpending, MonthSummary } from '../types/ledger.type'

const UNCATEGORIZED = {
  name: 'Sem categoria',
  color: '#94A3B8',
  emoji: '🧾',
}

export function transactionsOfMonth(
  transactions: Transaction[],
  month: string,
): Transaction[] {
  return transactions.filter(
    (transaction) => monthOf(transaction.date) === month,
  )
}

export function summarizeMonth(transactions: Transaction[]): MonthSummary {
  const incomeCents = transactions
    .filter((transaction) => transaction.kind === 'income')
    .reduce((total, transaction) => total + transaction.amountCents, 0)

  const expenseCents = transactions
    .filter((transaction) => transaction.kind === 'expense')
    .reduce((total, transaction) => total + transaction.amountCents, 0)

  return {
    incomeCents,
    expenseCents,
    balanceCents: incomeCents - expenseCents,
  }
}

export function spendingByCategory(
  transactions: Transaction[],
  categories: Category[],
): CategorySpending[] {
  const despesas = transactions.filter(
    (transaction) => transaction.kind === 'expense',
  )

  const total = despesas.reduce(
    (soma, transaction) => soma + transaction.amountCents,
    0,
  )

  const porCategoria = new Map<string | null, number>()

  for (const transaction of despesas) {
    const chave = transaction.categoryId ?? null

    porCategoria.set(
      chave,
      (porCategoria.get(chave) ?? 0) + transaction.amountCents,
    )
  }

  return [...porCategoria.entries()]
    .map<CategorySpending>(([categoryId, totalCents]) => {
      const category = categories.find((entry) => entry.id === categoryId)

      return {
        categoryId,
        name: category?.name ?? UNCATEGORIZED.name,
        color: category?.color ?? UNCATEGORIZED.color,
        emoji: category?.emoji ?? UNCATEGORIZED.emoji,
        totalCents,
        percent: total > 0 ? (totalCents / total) * 100 : 0,
      }
    })
    .sort((first, second) => second.totalCents - first.totalCents)
}

export function groupByDay(transactions: Transaction[]) {
  const porDia = new Map<string, Transaction[]>()

  for (const transaction of transactions) {
    porDia.set(transaction.date, [
      ...(porDia.get(transaction.date) ?? []),
      transaction,
    ])
  }

  return [...porDia.entries()]
    .sort(([first], [second]) => second.localeCompare(first))
    .map(([date, entries]) => ({
      date,
      transactions: entries,
      totalCents: entries.reduce(
        (total, transaction) =>
          total +
          (transaction.kind === 'income'
            ? transaction.amountCents
            : -transaction.amountCents),
        0,
      ),
    }))
}
