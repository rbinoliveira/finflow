'use client'

import { FieldShell } from '@/shared/components/field-shell'
import { cn } from '@/shared/utils/cn.util'
import { addDaysIso, shortDateLabel, todayIso } from '@/shared/utils/date.util'

type TransactionDateFieldProps = {
  value: string
  onChange: (date: string) => void
  error?: string
}

export function TransactionDateField({
  value,
  onChange,
  error,
}: TransactionDateFieldProps) {
  const hoje = todayIso()
  const ontem = addDaysIso(hoje, -1)

  const atalhos = [
    { label: 'Hoje', date: hoje },
    { label: 'Ontem', date: ontem },
  ]

  return (
    <FieldShell label="Data" error={error}>
      <div className="flex flex-wrap items-center gap-1.5">
        {atalhos.map((atalho) => {
          const active = value === atalho.date

          return (
            <button
              key={atalho.date}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(atalho.date)}
              className={cn(
                'rounded-full border px-3 py-2 text-xs font-medium transition-colors',
                active
                  ? 'bg-accent/12 text-accent border-transparent'
                  : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
              )}
            >
              {atalho.label}
            </button>
          )
        })}

        <label
          className={cn(
            'border-line text-ink-muted hover:border-line-strong relative flex items-center gap-1.5',
            'rounded-full border px-3 py-2 text-xs font-medium',
            value !== hoje &&
              value !== ontem &&
              'bg-accent/12 text-accent border-transparent',
          )}
        >
          <span aria-hidden>📅</span>
          {value !== hoje && value !== ontem ? shortDateLabel(value) : 'Outra'}
          <input
            type="date"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      </div>
    </FieldShell>
  )
}
