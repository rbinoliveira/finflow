import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '@/shared/utils/cn.util'

type CardProps = ComponentPropsWithoutRef<'div'> & {
  interactive?: boolean
}

export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'border-line bg-card rounded-2xl border',
        interactive &&
          'hover:border-line-strong transition-colors duration-150 hover:bg-white/3',
        className,
      )}
      {...props}
    />
  )
}
