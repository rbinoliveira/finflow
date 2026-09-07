import type { ReactNode } from 'react'

import { cn } from '@/shared/utils/cn.util'

type EmptyStateProps = {
  message: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ message, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-line flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-10 text-center',
        className,
      )}
    >
      <p className="text-ink-muted text-sm leading-[1.6]">{message}</p>
      {action}
    </div>
  )
}
