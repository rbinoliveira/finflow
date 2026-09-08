'use client'

import { SIGN_OUT_LABEL } from '@/features/platform/constants/app-identity.constants'
import { useFirebaseAuth } from '@/features/platform/providers/firebase-auth.provider'
import { Button } from '@/shared/components/button'

type AccessNoticeProps = {
  title: string
  message: string
}

/**
 * Tela de porta fechada. Segue o desenho do `app-sign-in-gate` de propósito:
 * para quem chega, entrar e esperar são o mesmo momento.
 */
export function AccessNotice({ title, message }: AccessNoticeProps) {
  const { user, signOut } = useFirebaseAuth()

  return (
    <div className="bg-base safe-top flex min-h-dvh flex-col items-center justify-center gap-7 px-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-ink text-2xl">{title}</h1>
        <p className="text-ink-muted max-w-[34ch] text-sm leading-[1.7]">
          {message}
        </p>
        {user?.email && (
          <p className="text-ink-faint mt-1 text-[12px]">{user.email}</p>
        )}
      </div>

      <Button variant="outline" onClick={signOut}>
        {SIGN_OUT_LABEL}
      </Button>
    </div>
  )
}
