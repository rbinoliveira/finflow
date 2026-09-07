'use client'

import { useId } from 'react'

import { FieldShell } from '@/shared/components/field-shell'
import { cn } from '@/shared/utils/cn.util'
import { formatMoneyValue, parseMoneyDigits } from '@/shared/utils/money.util'

type MoneyFieldProps = {
  label: string
  value: number
  onChange: (cents: number) => void
  hint?: string
  error?: string
  autoFocus?: boolean
  className?: string
  large?: boolean
}

export function MoneyField({
  label,
  value,
  onChange,
  hint,
  error,
  autoFocus,
  className,
  large = false,
}: MoneyFieldProps) {
  const id = useId()

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      htmlFor={id}
      className={className}
    >
      <div
        className={cn(
          'border-line-strong bg-surf flex items-baseline gap-2 rounded-xl border px-3.5',
          'focus-within:border-accent focus-within:ring-accent/50 focus-within:ring-2',
          large ? 'py-3' : 'py-2.5',
          error && 'border-danger',
        )}
      >
        <span
          className={cn(
            'text-ink-faint font-medium',
            large ? 'text-base' : 'text-sm',
          )}
        >
          R$
        </span>
        <input
          id={id}
          inputMode="numeric"
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          value={formatMoneyValue(value)}
          onChange={(event) => onChange(parseMoneyDigits(event.target.value))}
          onFocus={(event) => event.target.select()}
          className={cn(
            'numeric text-ink w-full bg-transparent text-right outline-none',
            large ? 'text-3xl font-semibold' : 'text-base font-medium',
          )}
        />
      </div>
    </FieldShell>
  )
}
