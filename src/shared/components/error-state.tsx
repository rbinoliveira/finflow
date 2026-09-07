'use client'

import { Button } from '@/shared/components/button'
import { cn } from '@/shared/utils/cn.util'

type ErrorStateProps = {
  message: string
  onTryAgain?: () => void
  className?: string
}

export function ErrorState({
  message,
  onTryAgain,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'border-danger/25 bg-danger/6 flex flex-col items-start gap-3 rounded-2xl border px-4 py-4',
        className,
      )}
    >
      <p className="text-ink-soft text-sm leading-[1.6]">{message}</p>
      {onTryAgain && (
        <Button variant="outline" onClick={onTryAgain}>
          Tentar de novo
        </Button>
      )}
    </div>
  )
}
