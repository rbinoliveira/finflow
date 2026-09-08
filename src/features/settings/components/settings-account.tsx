'use client'

import { SIGN_OUT_LABEL } from '@/features/platform/constants/app-identity.constants'
import { useFirebaseAuth } from '@/features/platform/providers/firebase-auth.provider'
import { Button } from '@/shared/components/button'
import { Card } from '@/shared/components/card'

export function SettingsAccount() {
  const { user, signOut } = useFirebaseAuth()

  return (
    <Card className="flex items-center gap-3 px-4 py-4">
      <span
        aria-hidden
        className="bg-accent/12 text-accent flex size-11 shrink-0 items-center justify-center rounded-full text-base font-semibold"
      >
        {(user?.displayName ?? user?.email ?? '?').charAt(0).toUpperCase()}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-ink truncate text-sm font-medium">
          {user?.displayName ?? 'Sua conta'}
        </span>
        <span className="text-ink-faint truncate text-[11px]">
          {user?.email}
        </span>
      </span>

      <Button variant="ghost" onClick={signOut}>
        {SIGN_OUT_LABEL}
      </Button>
    </Card>
  )
}
