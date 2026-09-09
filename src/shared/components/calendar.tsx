'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/shared/utils/cn.util'
import {
  dayInMonthIso,
  daysInMonth,
  firstWeekdayOfMonth,
  monthLabel,
  monthOf,
  shiftMonth,
  todayIso,
} from '@/shared/utils/date.util'

const WEEKDAY_INITIALS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

type CalendarProps = {
  value: string
  onChange: (iso: string) => void
  className?: string
}

export function Calendar({ value, onChange, className }: CalendarProps) {
  const [visible, setVisible] = useState(() => monthOf(value))

  /* Escolher uma data de outro mês por fora — os atalhos Hoje e Ontem viram o
     mês na virada — tem de levar o calendário junto, senão ele mostra um mês e
     o campo diz outro. */
  useEffect(() => setVisible(monthOf(value)), [value])

  const hoje = todayIso()
  const total = daysInMonth(visible)
  const primeiroDiaSemana = firstWeekdayOfMonth(visible)

  return (
    <div
      className={cn(
        'border-line-strong bg-surf flex flex-col gap-2 rounded-xl border p-2',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Mês anterior"
          onClick={() => setVisible(shiftMonth(visible, -1))}
          className="text-ink-muted hover:text-ink rounded-lg px-3 py-1 text-lg leading-none"
        >
          ‹
        </button>
        <span className="text-ink text-sm font-medium capitalize">
          {monthLabel(visible)}
        </span>
        <button
          type="button"
          aria-label="Próximo mês"
          onClick={() => setVisible(shiftMonth(visible, 1))}
          className="text-ink-muted hover:text-ink rounded-lg px-3 py-1 text-lg leading-none"
        >
          ›
        </button>
      </div>

      <div aria-hidden className="grid grid-cols-7 gap-1">
        {WEEKDAY_INITIALS.map((inicial, index) => (
          <span
            key={`${inicial}-${index}`}
            className="text-ink-faint py-1 text-center text-[10px] font-semibold"
          >
            {inicial}
          </span>
        ))}
      </div>

      <div
        role="radiogroup"
        aria-label="Escolha o dia"
        className="grid grid-cols-7 gap-1"
      >
        {Array.from({ length: primeiroDiaSemana }, (unused, index) => (
          <span key={`vazio-${index}`} />
        ))}

        {Array.from({ length: total }, (unused, index) => {
          const dia = index + 1
          const iso = dayInMonthIso(visible, dia)
          const selecionado = iso === value

          return (
            <button
              key={iso}
              type="button"
              role="radio"
              aria-checked={selecionado}
              aria-label={iso}
              onClick={() => onChange(iso)}
              className={cn(
                'numeric rounded-lg py-1.5 text-xs font-medium transition-colors',
                selecionado && 'bg-accent text-[color:var(--color-base)]',
                !selecionado &&
                  iso === hoje &&
                  'text-accent ring-accent/40 ring-1',
                !selecionado &&
                  iso !== hoje &&
                  'text-ink-muted hover:text-ink hover:bg-white/6',
              )}
            >
              {dia}
            </button>
          )
        })}
      </div>
    </div>
  )
}
