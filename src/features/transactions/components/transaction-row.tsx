'use client'

import { UNCATEGORIZED_LABEL } from '@/features/categories/constants/categories.constants'
import type { Category } from '@/features/categories/types/category.type'
import { cn } from '@/shared/utils/cn.util'
import { formatMoney } from '@/shared/utils/money.util'

import { PAYMENT_METHOD_LABEL } from '../constants/transactions.constants'
import type { Transaction } from '../types/transaction.type'

type TransactionRowProps = {
  transaction: Transaction
  category: Category | null
  cardName: string | null
  onSelect?: (transaction: Transaction) => void
}

export function TransactionRow({
  transaction,
  category,
  cardName,
  onSelect,
}: TransactionRowProps) {
  const income = transaction.kind === 'income'

  const detalhe = [
    PAYMENT_METHOD_LABEL[transaction.method],
    cardName,
    transaction.installments > 1 ? `${transaction.installments}×` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <button
      type="button"
      onClick={() => onSelect?.(transaction)}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/3"
    >
      <span
        aria-hidden
        style={{ backgroundColor: `${category?.color ?? '#94A3B8'}1F` }}
        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-base"
      >
        {category?.emoji ?? '🧾'}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-ink truncate text-sm font-medium">
          {transaction.description}
        </span>
        <span className="text-ink-faint truncate text-[11px]">
          {category?.name ?? UNCATEGORIZED_LABEL} · {detalhe}
        </span>
      </span>

      <span
        className={cn(
          'numeric shrink-0 text-sm font-semibold',
          income ? 'text-income' : 'text-ink',
        )}
      >
        {income ? '+' : '−'}
        {formatMoney(transaction.amountCents)}
      </span>
    </button>
  )
}
