'use client'

import { cn } from '@/shared/utils/cn.util'

type ChipOption = {
  value: string
  label: string
  emoji?: string
  color?: string
}

type ChipSelectProps = {
  value: string | null
  options: ChipOption[]
  onChange: (value: string) => void
  label?: string
  emptyMessage?: string
  className?: string
}

export function ChipSelect({
  value,
  options,
  onChange,
  label,
  emptyMessage,
  className,
}: ChipSelectProps) {
  if (options.length === 0 && emptyMessage) {
    return <p className="text-ink-faint text-xs">{emptyMessage}</p>
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('flex flex-wrap gap-1.5', className)}
    >
      {options.map((option) => {
        const active = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            style={
              active && option.color
                ? { backgroundColor: `${option.color}22`, color: option.color }
                : undefined
            }
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium',
              'border transition-colors',
              active
                ? 'border-transparent bg-accent/12 text-accent'
                : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
            )}
          >
            {option.emoji && <span aria-hidden>{option.emoji}</span>}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
