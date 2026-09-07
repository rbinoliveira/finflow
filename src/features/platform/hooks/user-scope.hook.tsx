'use client'

import { useFirebaseAuth } from '@/features/platform/providers/firebase-auth.provider'

export function useUserScope(): string | null {
  const { user } = useFirebaseAuth()

  return user?.uid ?? null
}
