'use client'

import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '@/shared/utils/cn.util'

type ButtonVariant = 'accent' | 'danger' | 'ghost' | 'outline' | 'surface'

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  accent:
    'bg-accent text-[color:var(--color-base)] hover:brightness-110 active:brightness-95',
  danger:
    'bg-danger text-[color:var(--color-base)] hover:brightness-110 active:brightness-95',
  ghost: 'bg-transparent text-ink-muted hover:text-ink',
  outline:
    'border border-line-strong bg-transparent text-ink hover:border-accent hover:bg-white/4',
  surface: 'bg-white/6 text-ink hover:bg-white/10',
}

export function Button({
  className,
  variant = 'accent',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5',
        'text-sm font-semibold transition duration-150',
        'focus-visible:ring-accent/50 focus-visible:ring-2 focus-visible:outline-none',
        'disabled:opacity-40',
        VARIANT_CLASS[variant],
        className,
      )}
      {...props}
    />
  )
}
