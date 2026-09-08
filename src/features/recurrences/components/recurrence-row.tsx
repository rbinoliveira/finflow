'use client'

import type { Category } from '@/features/categories/types/category.type'
import { PAYMENT_METHOD_LABEL } from '@/features/transactions/constants/transactions.constants'
import { Tag } from '@/shared/components/tag'
import { cn } from '@/shared/utils/cn.util'
import { shortDateLabel } from '@/shared/utils/date.util'
import { formatMoney } from '@/shared/utils/money.util'

import { RECURRENCE_INTERVAL_LABEL } from '../constants/recurrences.constants'
import type { Recurrence } from '../types/recurrence.type'
import { nextOccurrenceDate } from '../utils/recurrence-schedule.util'

type RecurrenceRowProps = {
  recurrence: Recurrence
  category: Category | null
  cardName: string | null
  onSelect: (recurrence: Recurrence) => void
}

export function RecurrenceRow({
  recurrence,
  category,
  cardName,
  onSelect,
}: RecurrenceRowProps) {
  const income = recurrence.kind === 'income'
  const proxima = nextOccurrenceDate(recurrence)

  const detalhe = [
    `dia ${recurrence.dayOfMonth}`,
    RECURRENCE_INTERVAL_LABEL[recurrence.everyMonths]?.toLowerCase(),
    cardName ?? PAYMENT_METHOD_LABEL[recurrence.method],
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <button
      type="button"
      onClick={() => onSelect(recurrence)}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/3"
    >
      <span
        aria-hidden
        style={{ backgroundColor: `${category?.color ?? '#94A3B8'}1F` }}
        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-base"
      >
        {category?.emoji ?? '🔁'}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-ink truncate text-sm font-medium">
          {recurrence.description}
        </span>
        <span className="text-ink-faint truncate text-[11px]">{detalhe}</span>
      </span>

      {recurrence.status === 'paused' && <Tag>Pausada</Tag>}

      <span className="flex shrink-0 flex-col items-end gap-0.5">
        <span
          className={cn(
            'numeric text-sm font-semibold',
            income ? 'text-income' : 'text-ink',
          )}
        >
          {income ? '+' : '−'}
          {formatMoney(recurrence.amountCents)}
        </span>
        {proxima && (
          <span className="text-ink-faint text-[11px]">
            próx. {shortDateLabel(proxima)}
          </span>
        )}
      </span>
    </button>
  )
}
