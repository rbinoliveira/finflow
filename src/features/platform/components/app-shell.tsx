import type { ReactNode } from 'react'

import { SyncIndicator } from '@/features/offline/components/sync-indicator'
import { AppBottomNavigation } from '@/features/platform/components/app-bottom-navigation'
import { AppQuickAddButton } from '@/features/platform/components/app-quick-add-button'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="bg-base flex min-h-dvh flex-col">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-app md:max-w-app-wide mx-auto w-full px-5 pt-4 pb-8 md:px-8 md:pt-6">
          <SyncIndicator />
          {children}
        </div>
      </main>
      <div className="relative">
        <div className="max-w-app md:max-w-app-wide relative mx-auto w-full">
          <AppQuickAddButton />
        </div>
        <AppBottomNavigation />
      </div>
    </div>
  )
}
