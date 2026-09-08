'use client'

import { FieldShell } from '@/shared/components/field-shell'
import { cn } from '@/shared/utils/cn.util'

type DayPickerProps = {
  label: string
  value: number
  onChange: (day: number) => void
  hint?: string
  error?: string
  max?: number
  className?: string
}

export function DayPicker({
  label,
  value,
  onChange,
  hint,
  error,
  max = 31,
  className,
}: DayPickerProps) {
  const days = Array.from({ length: max }, (unused, index) => index + 1)

  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      <div
        role="radiogroup"
        aria-label={label}
        className="border-line-strong bg-surf grid grid-cols-7 gap-1 rounded-xl border p-2"
      >
        {days.map((day) => {
          const active = day === value

          return (
            <button
              key={day}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(day)}
              className={cn(
                'numeric rounded-lg py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'bg-accent text-[color:var(--color-base)]'
                  : 'text-ink-muted hover:text-ink hover:bg-white/6',
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </FieldShell>
  )
}
