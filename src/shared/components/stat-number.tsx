import { cn } from '@/shared/utils/cn.util'

type StatNumberProps = {
  value: string
  label: string
  className?: string
  valueClassName?: string
}

export function StatNumber({
  value,
  label,
  className,
  valueClassName,
}: StatNumberProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span
        className={cn(
          'numeric text-ink text-2xl leading-none font-semibold',
          valueClassName,
        )}
      >
        {value}
      </span>
      <span className="text-ink-faint text-[11px] leading-snug">{label}</span>
    </div>
  )
}
