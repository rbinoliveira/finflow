'use client'

import { useSync } from '@/features/offline/providers/sync.provider'
import { cn } from '@/shared/utils/cn.util'

export function SyncIndicator() {
  const { online, pending, syncing, rejected, dismissRejected } = useSync()

  if (rejected > 0) {
    return (
      <div
        role="alert"
        className="bg-danger/10 text-danger mb-3 flex items-center gap-3 rounded-xl px-3 py-2 text-[11px] font-medium"
      >
        <span className="flex-1">
          {rejected === 1
            ? '1 alteração foi recusada pelo servidor e desfeita neste aparelho.'
            : `${rejected} alterações foram recusadas pelo servidor e desfeitas neste aparelho.`}
        </span>
        <button
          type="button"
          onClick={dismissRejected}
          className="shrink-0 font-semibold underline"
        >
          Ok
        </button>
      </div>
    )
  }

  if (online && pending === 0 && !syncing) return null

  const label = !online
    ? pending > 0
      ? `Offline · ${pending} para enviar`
      : 'Offline · alterações ficam salvas aqui'
    : syncing
      ? 'Sincronizando…'
      : `${pending} para enviar`

  return (
    <div
      role="status"
      className={cn(
        'mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-medium',
        online ? 'bg-info/10 text-info' : 'bg-warn/10 text-warn',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          online ? 'bg-info' : 'bg-warn',
          syncing && 'animate-pulse',
        )}
      />
      {label}
    </div>
  )
}
