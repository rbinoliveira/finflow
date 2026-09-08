'use client'

import type { ReactNode } from 'react'

import { EmptyState } from '@/shared/components/empty-state'

import { MESSAGE_BLOCKED } from '../constants/access.constants'
import { useAccess } from '../providers/access.provider'

/**
 * Esconde a tela de administração de quem não é admin. É conveniência de
 * interface: a garantia real é a regra do Firestore, que recusa a leitura de
 * `/members` para qualquer outro — sem ela, esconder a rota não protegeria nada.
 */
export function AccessGuard({ children }: { children: ReactNode }) {
  const { isAdmin } = useAccess()

  if (!isAdmin) return <EmptyState message={MESSAGE_BLOCKED} />

  return <>{children}</>
}
