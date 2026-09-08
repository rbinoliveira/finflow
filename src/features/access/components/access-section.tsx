import { EmptyState } from '@/shared/components/empty-state'

import type { MemberDocument } from '../types/access.type'
import { AccessMemberRow } from './access-member-row'

type AccessSectionProps = {
  title: string
  members: MemberDocument[]
  empty: string
  disabled: boolean
  onApprove?: (uid: string) => void
  onBlock?: (member: MemberDocument) => void
}

export function AccessSection({
  title,
  members,
  empty,
  disabled,
  onApprove,
  onBlock,
}: AccessSectionProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-ink-faint text-[11px] font-medium tracking-wide uppercase">
        {title}
      </h2>

      {members.length === 0 ? (
        <EmptyState message={empty} />
      ) : (
        members.map((member) => (
          <AccessMemberRow
            key={member.id}
            member={member}
            disabled={disabled}
            onApprove={onApprove ? () => onApprove(member.id) : undefined}
            onBlock={onBlock ? () => onBlock(member) : undefined}
          />
        ))
      )}
    </section>
  )
}
