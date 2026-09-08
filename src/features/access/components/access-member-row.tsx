'use client'

import { Button } from '@/shared/components/button'
import { Card } from '@/shared/components/card'
import { timestampToDate } from '@/shared/utils/firestore-document.util'

import { APPROVE_LABEL, BLOCK_LABEL } from '../constants/access.constants'
import type { MemberDocument } from '../types/access.type'

type AccessMemberRowProps = {
  member: MemberDocument
  disabled: boolean
  onApprove?: () => void
  onBlock?: () => void
}

export function AccessMemberRow({
  member,
  disabled,
  onApprove,
  onBlock,
}: AccessMemberRowProps) {
  const at = timestampToDate(member.decidedAt ?? member.requestedAt)

  return (
    <Card className="flex items-center justify-between gap-3 px-3.5 py-3">
      <div className="min-w-0">
        <p className="text-ink truncate text-[13px]">{member.email}</p>
        {at && (
          <p className="text-ink-faint numeric text-[11px]">
            {at.toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>

      <div className="flex flex-none gap-2">
        {onApprove && (
          <Button
            disabled={disabled}
            onClick={onApprove}
            className="px-3 py-1.5 text-[12px]"
          >
            {APPROVE_LABEL}
          </Button>
        )}
        {onBlock && (
          <Button
            variant="outline"
            disabled={disabled}
            onClick={onBlock}
            className="px-3 py-1.5 text-[12px]"
          >
            {BLOCK_LABEL}
          </Button>
        )}
      </div>
    </Card>
  )
}
