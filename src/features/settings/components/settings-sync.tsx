'use client'

import { useSync } from '@/features/offline/providers/sync.provider'
import { Button } from '@/shared/components/button'
import { Card } from '@/shared/components/card'
import { Tag } from '@/shared/components/tag'

import { SYNC_HELP } from '../constants/settings.constants'

export function SettingsSync() {
  const { online, pending, syncing, sync } = useSync()

  return (
    <Card className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-ink text-sm font-medium">Sincronização</span>
        <Tag tone={online ? 'accent' : 'warn'}>
          {online ? 'Conectado' : 'Offline'}
        </Tag>
      </div>

      <p className="text-ink-faint text-[11px] leading-[1.6]">{SYNC_HELP}</p>

      <div className="flex items-center justify-between gap-3">
        <span className="numeric text-ink-muted text-xs">
          {pending === 0
            ? 'Tudo enviado'
            : `${pending} ${pending === 1 ? 'lançamento pendente' : 'lançamentos pendentes'}`}
        </span>
        <Button
          variant="outline"
          onClick={() => sync().catch(() => undefined)}
          disabled={!online || syncing}
        >
          {syncing ? 'Enviando…' : 'Sincronizar agora'}
        </Button>
      </div>
    </Card>
  )
}
