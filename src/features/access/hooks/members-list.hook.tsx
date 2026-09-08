'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  describeFirestoreError,
  logFirestoreError,
} from '@/shared/utils/firestore-error.util'

import type { AccessStatus, MemberDocument } from '../types/access.type'
import { decideMemberUseCase } from '../use-cases/member-decide.use-case'
import { listMembersUseCase } from '../use-cases/members-list.use-case'

export function useMembersList() {
  const [members, setMembers] = useState<MemberDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deciding, setDeciding] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      setMembers(await listMembersUseCase())
    } catch (caught) {
      logFirestoreError('members-list.hook', caught)
      setError(describeFirestoreError(caught))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload().catch(() => undefined)
  }, [reload])

  const decide = useCallback(
    async (
      uid: string,
      status: Extract<AccessStatus, 'approved' | 'blocked'>,
    ) => {
      if (deciding) return

      setDeciding(true)

      try {
        await decideMemberUseCase(uid, status)
        await reload()
      } catch (caught) {
        logFirestoreError('members-list.hook', caught)
        setError(describeFirestoreError(caught))
      } finally {
        setDeciding(false)
      }
    },
    [deciding, reload],
  )

  return {
    members,
    pending: members.filter((member) => member.status === 'pending'),
    approved: members.filter((member) => member.status === 'approved'),
    blocked: members.filter((member) => member.status === 'blocked'),
    loading,
    error,
    deciding,
    decide,
    reload,
  }
}
