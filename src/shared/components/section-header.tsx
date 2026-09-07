import type { ReactNode } from 'react'

import { cn } from '@/shared/utils/cn.util'

type SectionHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function SectionHeader({
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-3 flex items-end justify-between gap-3', className)}>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-ink text-base">{title}</h2>
        {description && (
          <p className="text-ink-faint text-xs">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
