import type { ReactNode } from 'react'

import { SyncIndicator } from '@/features/offline/components/sync-indicator'
import { AppBottomNavigation } from '@/features/platform/components/app-bottom-navigation'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="bg-base flex min-h-dvh flex-col">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-app md:max-w-app-wide safe-top mx-auto w-full px-5 pb-8 md:px-8">
          <SyncIndicator />
          {children}
        </div>
      </main>
      <AppBottomNavigation />
    </div>
  )
}
