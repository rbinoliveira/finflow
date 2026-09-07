'use client'

import { type ComponentPropsWithoutRef, useId } from 'react'

import { FieldShell } from '@/shared/components/field-shell'
import { cn } from '@/shared/utils/cn.util'

type TextFieldProps = Omit<ComponentPropsWithoutRef<'input'>, 'id'> & {
  label: string
  hint?: string
  error?: string
}

export function TextField({
  label,
  hint,
  error,
  className,
  ...props
}: TextFieldProps) {
  const id = useId()

  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(
          'border-line-strong bg-surf text-ink rounded-xl border px-3.5 py-2.5 text-sm',
          'placeholder:text-ink-faint',
          'focus-visible:border-accent focus-visible:ring-accent/50 focus-visible:ring-2 focus-visible:outline-none',
          error && 'border-danger',
          className,
        )}
        {...props}
      />
    </FieldShell>
  )
}
