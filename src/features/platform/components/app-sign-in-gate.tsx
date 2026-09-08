'use client'

import type { ReactNode } from 'react'

import {
  APP_NAME,
  APP_SHORT_DESCRIPTION,
  SIGN_IN_LABEL,
} from '@/features/platform/constants/app-identity.constants'
import { useFirebaseAuth } from '@/features/platform/providers/firebase-auth.provider'
import { Button } from '@/shared/components/button'

type AppSignInGateProps = {
  children: ReactNode
}

export function AppSignInGate({ children }: AppSignInGateProps) {
  const { status, signIn } = useFirebaseAuth()

  if (status === 'loading') {
    return <div className="bg-base min-h-dvh" />
  }

  if (status === 'sign-in') {
    return (
      <div className="bg-base flex min-h-dvh flex-col items-center justify-center gap-8 px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span aria-hidden className="text-4xl">
            📊
          </span>
          <h1 className="text-ink text-3xl">{APP_NAME}</h1>
          <p className="text-ink-muted text-sm leading-[1.7]">
            {APP_SHORT_DESCRIPTION}
          </p>
        </div>
        <Button onClick={signIn}>{SIGN_IN_LABEL}</Button>
      </div>
    )
  }

  return <>{children}</>
}
