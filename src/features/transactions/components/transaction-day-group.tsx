'use client'

import type { CreditCard } from '@/features/cards/types/card.type'
import type { Category } from '@/features/categories/types/category.type'
import { Card } from '@/shared/components/card'
import { cn } from '@/shared/utils/cn.util'
import { dayLabel } from '@/shared/utils/date.util'
import { formatSignedMoney } from '@/shared/utils/money.util'

import type { Transaction } from '../types/transaction.type'
import { TransactionRow } from './transaction-row'

type TransactionDayGroupProps = {
  date: string
  totalCents: number
  transactions: Transaction[]
  categories: Category[]
  cards: CreditCard[]
  onSelect: (transaction: Transaction) => void
}

export function TransactionDayGroup({
  date,
  totalCents,
  transactions,
  categories,
  cards,
  onSelect,
}: TransactionDayGroupProps) {
  return (
    <section className="flex flex-col gap-2">
      <header className="flex items-baseline justify-between px-1">
        <h3 className="text-ink-muted text-xs font-medium capitalize">
          {dayLabel(date)}
        </h3>
        <span
          className={cn(
            'numeric text-[11px] font-medium',
            totalCents >= 0 ? 'text-income' : 'text-ink-faint',
          )}
        >
          {formatSignedMoney(totalCents)}
        </span>
      </header>

      <Card className="px-1 py-1">
        {transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            category={
              categories.find(
                (category) => category.id === transaction.categoryId,
              ) ?? null
            }
            cardName={
              cards.find((card) => card.id === transaction.cardId)?.name ?? null
            }
            onSelect={onSelect}
          />
        ))}
      </Card>
    </section>
  )
}
