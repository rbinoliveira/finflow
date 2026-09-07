import type { ReactNode } from 'react'

import { cn } from '@/shared/utils/cn.util'

type FieldShellProps = {
  label: string
  hint?: string
  error?: string
  htmlFor?: string
  className?: string
  children: ReactNode
}

export function FieldShell({
  label,
  hint,
  error,
  htmlFor,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-ink-muted text-[11px] font-medium tracking-wide uppercase"
      >
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-danger text-[11px]">{error}</span>
      ) : (
        hint && <span className="text-ink-faint text-[11px]">{hint}</span>
      )}
    </div>
  )
}
