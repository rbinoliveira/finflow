'use client'

import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import type { SyncState } from '@/features/offline/types/offline.type'
import { countPendingUseCase } from '@/features/offline/use-cases/outbox.use-case'
import { syncOutboxUseCase } from '@/features/offline/use-cases/sync-outbox.use-case'
import { isOnline } from '@/features/offline/utils/network-status.util'
import { useFirebaseAuth } from '@/features/platform/providers/firebase-auth.provider'

type SyncContextValue = SyncState & {
  sync: () => Promise<void>
  refreshPending: () => Promise<void>
  dismissRejected: () => void
}

const SyncContext = createContext<SyncContextValue>({
  online: true,
  pending: 0,
  syncing: false,
  lastSyncedAt: null,
  rejected: 0,
  sync: async () => undefined,
  refreshPending: async () => undefined,
  dismissRejected: () => undefined,
})

const PENDING_POLL_MS = 4000

type SyncProviderProps = {
  children: ReactNode
}

export function SyncProvider({ children }: SyncProviderProps) {
  const { user } = useFirebaseAuth()
  const [online, setOnline] = useState(true)
  const [pending, setPending] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
  const [rejected, setRejected] = useState(0)

  const refreshPending = useCallback(async () => {
    setPending(await countPendingUseCase())
  }, [])

  const sync = useCallback(async () => {
    if (!user || !isOnline()) {
      await refreshPending()
      return
    }

    setSyncing(true)

    try {
      const result = await syncOutboxUseCase(user.uid)

      setPending(result.pending)
      if (result.applied > 0) setLastSyncedAt(Date.now())
      if (result.rejected > 0) {
        setRejected((total) => total + result.rejected)
      }
    } finally {
      setSyncing(false)
    }
  }, [user, refreshPending])

  useEffect(() => {
    setOnline(isOnline())

    const goOnline = () => {
      setOnline(true)
      sync().catch(() => undefined)
    }
    const goOffline = () => setOnline(false)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [sync])

  useEffect(() => {
    if (!user) return

    sync().catch(() => undefined)

    const timer = window.setInterval(() => {
      refreshPending().catch(() => undefined)
    }, PENDING_POLL_MS)

    return () => window.clearInterval(timer)
  }, [user, sync, refreshPending])

  const dismissRejected = useCallback(() => setRejected(0), [])

  const value = useMemo(
    () => ({
      online,
      pending,
      syncing,
      lastSyncedAt,
      rejected,
      sync,
      refreshPending,
      dismissRejected,
    }),
    [
      online,
      pending,
      syncing,
      lastSyncedAt,
      rejected,
      sync,
      refreshPending,
      dismissRejected,
    ],
  )

  return <SyncContext value={value}>{children}</SyncContext>
}

export function useSync() {
  return use(SyncContext)
}
