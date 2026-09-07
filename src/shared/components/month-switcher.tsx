'use client'

import { cn } from '@/shared/utils/cn.util'
import { monthLabel, shiftMonth } from '@/shared/utils/date.util'

type MonthSwitcherProps = {
  month: string
  onChange: (month: string) => void
  className?: string
}

export function MonthSwitcher({
  month,
  onChange,
  className,
}: MonthSwitcherProps) {
  return (
    <div
      className={cn(
        'border-line bg-surf flex items-center justify-between rounded-xl border px-1.5 py-1.5',
        className,
      )}
    >
      <button
        type="button"
        aria-label="Mês anterior"
        onClick={() => onChange(shiftMonth(month, -1))}
        className="text-ink-muted hover:text-ink rounded-lg px-3 py-1 text-lg leading-none"
      >
        ‹
      </button>
      <span className="text-ink text-sm font-medium capitalize">
        {monthLabel(month)}
      </span>
      <button
        type="button"
        aria-label="Próximo mês"
        onClick={() => onChange(shiftMonth(month, 1))}
        className="text-ink-muted hover:text-ink rounded-lg px-3 py-1 text-lg leading-none"
      >
        ›
      </button>
    </div>
  )
}
