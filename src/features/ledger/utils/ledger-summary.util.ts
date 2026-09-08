import type { CreditCard } from '@/features/cards/types/card.type'
import { UNCATEGORIZED_LABEL } from '@/features/categories/constants/categories.constants'
import type { Category } from '@/features/categories/types/category.type'
import {
  PAYMENT_METHOD_COLOR,
  PAYMENT_METHOD_EMOJI,
  PAYMENT_METHOD_LABEL,
} from '@/features/transactions/constants/transactions.constants'
import type { Transaction } from '@/features/transactions/types/transaction.type'
import { monthOf } from '@/shared/utils/date.util'

import type { MonthSummary, SpendingSlice } from '../types/ledger.type'

const UNCATEGORIZED = {
  name: UNCATEGORIZED_LABEL,
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
): SpendingSlice[] {
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
    .map<SpendingSlice>(([categoryId, totalCents]) => {
      const category = categories.find((entry) => entry.id === categoryId)

      return {
        id: categoryId ?? 'sem-categoria',
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

/**
 * Gasto do mês por forma de pagamento, com cada cartão aparecendo sozinho ao
 * lado de PIX, débito, dinheiro e boleto — a pergunta é "onde meu dinheiro
 * saiu", e um bloco só chamado "cartão" não responde quem tem mais de um.
 *
 * A base é o valor da compra no mês em que ela foi feita, a mesma da quebra
 * por categoria: assim as duas somam o mesmo total. Quanto cai em cada fatura
 * é outra pergunta, e quem responde é a tela do cartão.
 */
export function spendingBySource(
  transactions: Transaction[],
  cards: CreditCard[],
): SpendingSlice[] {
  const despesas = transactions.filter(
    (transaction) => transaction.kind === 'expense',
  )

  const total = despesas.reduce(
    (soma, transaction) => soma + transaction.amountCents,
    0,
  )

  const porOrigem = new Map<string, number>()

  const chaveDe = (transaction: Transaction) =>
    transaction.method === 'card' && transaction.cardId
      ? `card:${transaction.cardId}`
      : `method:${transaction.method}`

  for (const transaction of despesas) {
    const chave = chaveDe(transaction)

    porOrigem.set(chave, (porOrigem.get(chave) ?? 0) + transaction.amountCents)
  }

  return [...porOrigem.entries()]
    .map<SpendingSlice>(([chave, totalCents]) => {
      const [tipo, valor] = chave.split(':')

      if (tipo === 'card') {
        const card = cards.find((entry) => entry.id === valor)

        return {
          id: chave,
          name: card?.name ?? 'Cartão removido',
          color: card?.color ?? PAYMENT_METHOD_COLOR.card,
          emoji: PAYMENT_METHOD_EMOJI.card,
          totalCents,
          percent: total > 0 ? (totalCents / total) * 100 : 0,
        }
      }

      const method = valor as keyof typeof PAYMENT_METHOD_LABEL

      return {
        id: chave,
        name: PAYMENT_METHOD_LABEL[method],
        color: PAYMENT_METHOD_COLOR[method],
        emoji: PAYMENT_METHOD_EMOJI[method],
        totalCents,
        percent: total > 0 ? (totalCents / total) * 100 : 0,
      }
    })
    .sort((first, second) => second.totalCents - first.totalCents)
}
