'use client'

import { type ComponentPropsWithoutRef, useId } from 'react'

import { FieldShell } from '@/shared/components/field-shell'
import { cn } from '@/shared/utils/cn.util'

type SelectOption = {
  value: string
  label: string
}

type SelectFieldProps = Omit<ComponentPropsWithoutRef<'select'>, 'id'> & {
  label: string
  hint?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export function SelectField({
  label,
  hint,
  error,
  options,
  placeholder,
  className,
  ...props
}: SelectFieldProps) {
  const id = useId()

  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(
          'border-line-strong bg-surf text-ink rounded-xl border px-3.5 py-2.5 text-sm',
          'focus-visible:border-accent focus-visible:ring-accent/50 focus-visible:ring-2 focus-visible:outline-none',
          error && 'border-danger',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}
