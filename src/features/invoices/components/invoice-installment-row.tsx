'use client'

import type { Category } from '@/features/categories/types/category.type'
import { cn } from '@/shared/utils/cn.util'
import { shortDateLabel } from '@/shared/utils/date.util'
import { formatMoney } from '@/shared/utils/money.util'

import type { Installment } from '../types/installment.type'

type InvoiceInstallmentRowProps = {
  installment: Installment
  category: Category | null
  onAdjust: (installment: Installment) => void
}

export function InvoiceInstallmentRow({
  installment,
  category,
  onAdjust,
}: InvoiceInstallmentRowProps) {
  return (
    <button
      type="button"
      onClick={() => onAdjust(installment)}
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
          {installment.description}
        </span>
        <span className="text-ink-faint truncate text-[11px]">
          {installment.total > 1
            ? `parcela ${installment.number}/${installment.total} · `
            : ''}
          vence {shortDateLabel(installment.dueDate)}
        </span>
      </span>

      <span
        className={cn(
          'numeric shrink-0 text-sm font-semibold',
          installment.paid ? 'text-ink-faint line-through' : 'text-ink',
        )}
      >
        {formatMoney(installment.amountCents)}
      </span>
    </button>
  )
}
