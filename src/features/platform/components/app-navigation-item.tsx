import Link from 'next/link'

import type { NavigationDestination } from '@/features/platform/types/navigation.type'
import { cn } from '@/shared/utils/cn.util'

type AppNavigationItemProps = {
  destination: NavigationDestination
  active: boolean
}

export function AppNavigationItem({
  destination,
  active,
}: AppNavigationItemProps) {
  const Icon = destination.icon

  return (
    <Link
      href={destination.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex flex-col items-center gap-1.5 py-1 text-[9.5px] font-medium transition-colors',
        active ? 'text-accent' : 'text-ink-faint hover:text-ink-muted',
      )}
    >
      <Icon className="size-[22px]" />
      {destination.label}
    </Link>
  )
}
