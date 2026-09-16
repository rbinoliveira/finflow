'use client'

import type { Category } from '@/features/categories/types/category.type'
import { RECURRING_TAG_LABEL } from '@/features/transactions/constants/transactions.constants'
import { Tag } from '@/shared/components/tag'
import { cn } from '@/shared/utils/cn.util'
import { shortDateLabel, shortMonthLabel } from '@/shared/utils/date.util'
import { formatMoney } from '@/shared/utils/money.util'

import { BILL_COPY } from '../constants/recurrences.constants'
import type { RecurrenceBill } from '../types/recurrence.type'
import { billDueSoon, billOverdue } from '../utils/recurrence-schedule.util'

type RecurrenceBillRowProps = {
  bill: RecurrenceBill
  category: Category | null
  showMonth?: boolean
  /** Fora da tela de recorrências, a conta precisa dizer de onde veio e,
   *  entre lançamentos já feitos, que ainda está em aberto. */
  showRecurring?: boolean
  showPending?: boolean
  onSelect: (bill: RecurrenceBill) => void
}

export function RecurrenceBillRow({
  bill,
  category,
  showMonth = false,
  showRecurring = false,
  showPending = false,
  onSelect,
}: RecurrenceBillRowProps) {
  const atrasada = billOverdue(bill)
  const perto = !atrasada && billDueSoon(bill)
  const receita = bill.recurrence.kind === 'income'
  const copy = BILL_COPY[bill.recurrence.kind]

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
        {bill.paid ? '✓' : (category?.emoji ?? (receita ? '💰' : '🔁'))}
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
          {bill.paid ? copy.settled : copy.due} {shortDateLabel(bill.dueDate)}
          {showMonth
            ? ` · ${shortMonthLabel(bill.month)}/${bill.month.slice(2, 4)}`
            : ''}
        </span>
      </span>

      {showRecurring && <Tag tone="info">{RECURRING_TAG_LABEL}</Tag>}
      {atrasada && <Tag tone="danger">Atrasada</Tag>}
      {perto && <Tag tone="warn">Perto</Tag>}
      {showPending && !bill.paid && !atrasada && !perto && (
        <Tag>{copy.pendingTag}</Tag>
      )}

      <span
        className={cn(
          'numeric shrink-0 text-sm font-semibold',
          bill.paid && 'text-ink-faint line-through',
          !bill.paid && receita && 'text-income',
          !bill.paid && !receita && 'text-ink',
        )}
      >
        {receita ? '+' : ''}
        {formatMoney(bill.amountCents)}
      </span>
    </button>
  )
}
