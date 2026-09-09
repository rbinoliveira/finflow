'use client'

import { useState } from 'react'

import { Calendar } from '@/shared/components/calendar'
import { FieldShell } from '@/shared/components/field-shell'
import { cn } from '@/shared/utils/cn.util'
import { addDaysIso, shortDateLabel, todayIso } from '@/shared/utils/date.util'

type TransactionDateFieldProps = {
  value: string
  onChange: (date: string) => void
  label?: string
  error?: string
}

export function TransactionDateField({
  value,
  onChange,
  label = 'Data',
  error,
}: TransactionDateFieldProps) {
  const hoje = todayIso()
  const ontem = addDaysIso(hoje, -1)

  const outraData = value !== hoje && value !== ontem
  const [aberto, setAberto] = useState(outraData)

  const atalhos = [
    { label: 'Hoje', date: hoje },
    { label: 'Ontem', date: ontem },
  ]

  return (
    <FieldShell label={label} error={error}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {atalhos.map((atalho) => {
            const active = value === atalho.date

            return (
              <button
                key={atalho.date}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  onChange(atalho.date)
                  setAberto(false)
                }}
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

          <button
            type="button"
            aria-expanded={aberto}
            onClick={() => setAberto((atual) => !atual)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-2',
              'text-xs font-medium transition-colors',
              outraData
                ? 'bg-accent/12 text-accent border-transparent'
                : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
            )}
          >
            <span aria-hidden>📅</span>
            {outraData ? shortDateLabel(value) : 'Outra'}
          </button>
        </div>

        {aberto && <Calendar value={value} onChange={onChange} />}
      </div>
    </FieldShell>
  )
}
