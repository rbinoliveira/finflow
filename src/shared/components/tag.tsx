import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '@/shared/utils/cn.util'

type TagTone = 'accent' | 'muted' | 'info' | 'warn' | 'danger'

type TagProps = ComponentPropsWithoutRef<'span'> & {
  tone?: TagTone
}

const TONE_CLASS: Record<TagTone, string> = {
  accent: 'bg-accent/10 text-accent',
  muted: 'bg-white/6 text-ink-faint',
  info: 'bg-info/10 text-info',
  warn: 'bg-warn/10 text-warn',
  danger: 'bg-danger/10 text-danger',
}

export function Tag({ className, tone = 'muted', ...props }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-1',
        'text-[9.5px] font-bold tracking-[0.08em] uppercase',
        TONE_CLASS[tone],
        className,
      )}
      {...props}
    />
  )
}
