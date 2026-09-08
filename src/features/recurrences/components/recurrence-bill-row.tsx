'use client'

import type { Category } from '@/features/categories/types/category.type'
import { Tag } from '@/shared/components/tag'
import { cn } from '@/shared/utils/cn.util'
import { shortDateLabel, shortMonthLabel } from '@/shared/utils/date.util'
import { formatMoney } from '@/shared/utils/money.util'

import type { RecurrenceBill } from '../types/recurrence.type'
import { billDueSoon, billOverdue } from '../utils/recurrence-schedule.util'

type RecurrenceBillRowProps = {
  bill: RecurrenceBill
  category: Category | null
  showMonth?: boolean
  onSelect: (bill: RecurrenceBill) => void
}

export function RecurrenceBillRow({
  bill,
  category,
  showMonth = false,
  onSelect,
}: RecurrenceBillRowProps) {
  const atrasada = billOverdue(bill)
  const perto = !atrasada && billDueSoon(bill)

  return (
    <button
      type="button"
      onClick={() => onSelect(bill)}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/3"
    >
      <span
        aria-hidden
        style={{
          backgroundColor: bill.paid
            ? undefined
            : `${category?.color ?? '#94A3B8'}1F`,
        }}
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl text-base',
          bill.paid && 'bg-income/12',
        )}
      >
        {bill.paid ? '✓' : (category?.emoji ?? '🔁')}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            'truncate text-sm font-medium',
            bill.paid ? 'text-ink-muted' : 'text-ink',
          )}
        >
          {bill.recurrence.description}
        </span>
        <span className="text-ink-faint truncate text-[11px]">
          {bill.paid ? 'paga' : 'vence'} {shortDateLabel(bill.dueDate)}
          {showMonth
            ? ` · ${shortMonthLabel(bill.month)}/${bill.month.slice(2, 4)}`
            : ''}
        </span>
      </span>

      {atrasada && <Tag tone="danger">Atrasada</Tag>}
      {perto && <Tag tone="warn">Perto</Tag>}

      <span
        className={cn(
          'numeric shrink-0 text-sm font-semibold',
          bill.paid ? 'text-ink-faint line-through' : 'text-ink',
        )}
      >
        {formatMoney(bill.amountCents)}
      </span>
    </button>
  )
}
