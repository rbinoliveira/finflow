'use client'

import Link from 'next/link'
import { useState } from 'react'

import { APP_ROUTES } from '@/features/platform/constants/app-routes.constants'
import { DataHandler } from '@/shared/components/data-handler'

import { AccessBlockDialog } from '../components/access-block-dialog'
import { AccessGuard } from '../components/access-guard'
import { AccessSection } from '../components/access-section'
import {
  ACCESS_SUBTITLE,
  ACCESS_TITLE,
  APPROVED_HEADER,
  BLOCKED_HEADER,
  MESSAGE_NO_MEMBERS,
  MESSAGE_NO_REQUESTS,
  PENDING_HEADER,
} from '../constants/access.constants'
import { useMembersList } from '../hooks/members-list.hook'
import type { MemberDocument } from '../types/access.type'

export function AccessPage() {
  const list = useMembersList()
  const [blocking, setBlocking] = useState<MemberDocument | null>(null)

  return (
    <AccessGuard>
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-1">
          <Link
            href={APP_ROUTES.settings}
            className="text-ink-muted hover:text-ink text-xs font-medium"
          >
            ‹ Ajustes
          </Link>
          <h1 className="text-ink mt-3 text-xl">{ACCESS_TITLE}</h1>
          <p className="text-ink-muted text-[12.5px] leading-[1.5]">
            {ACCESS_SUBTITLE}
          </p>
        </header>

        <DataHandler
          loading={list.loading}
          error={list.error}
          empty={false}
          emptyMessage={MESSAGE_NO_REQUESTS}
          onTryAgain={list.reload}
        >
          <div className="flex flex-col gap-6">
            <AccessSection
              title={PENDING_HEADER}
              members={list.pending}
              empty={MESSAGE_NO_REQUESTS}
              disabled={list.deciding}
              onApprove={(uid) => list.decide(uid, 'approved')}
            />

            <AccessSection
              title={APPROVED_HEADER}
              members={list.approved}
              empty={MESSAGE_NO_MEMBERS}
              disabled={list.deciding}
              onBlock={setBlocking}
            />

            {list.blocked.length > 0 && (
              <AccessSection
                title={BLOCKED_HEADER}
                members={list.blocked}
                empty=""
                disabled={list.deciding}
                onApprove={(uid) => list.decide(uid, 'approved')}
              />
            )}
          </div>
        </DataHandler>

        <AccessBlockDialog
          email={blocking?.email ?? null}
          onClose={() => setBlocking(null)}
          onConfirm={() => {
            if (blocking) list.decide(blocking.id, 'blocked')
            setBlocking(null)
          }}
        />
      </div>
    </AccessGuard>
  )
}
