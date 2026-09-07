import { cn } from '@/shared/utils/cn.util'

type ProgressBarProps = {
  value: number
  className?: string
  barClassName?: string
}

export function ProgressBar({
  value,
  className,
  barClassName,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'h-1.5 w-full overflow-hidden rounded-full bg-white/8',
        className,
      )}
    >
      <div
        className={cn('bg-accent h-full rounded-full', barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
