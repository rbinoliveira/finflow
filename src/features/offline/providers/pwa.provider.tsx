'use client'

import { type ReactNode, useEffect } from 'react'

import { WEB_MANIFEST_PATH } from '@/features/offline/constants/offline-storage.constants'
import {
  recordServiceWorker,
  requestPersistentStorage,
} from '@/features/offline/utils/service-worker.util'

type PwaProviderProps = {
  children: ReactNode
}

export function PwaProvider({ children }: PwaProviderProps) {
  useEffect(() => {
    requestPersistentStorage().catch(() => undefined)

    if (process.env.NODE_ENV === 'production')
      recordServiceWorker().catch(() => undefined)
  }, [])

  return (
    <>
      <link rel="manifest" href={WEB_MANIFEST_PATH} />
      {children}
    </>
  )
}
