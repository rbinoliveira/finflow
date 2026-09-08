'use client'

import { createContext, type ReactNode, use } from 'react'

import { useAccessState } from '../hooks/access-state.hook'
import type { AccessState } from '../types/access.type'

type AccessContextValue = {
  state: AccessState
  isAdmin: boolean
  reload: () => Promise<void>
}

const AccessContext = createContext<AccessContextValue>({
  state: 'unknown',
  isAdmin: false,
  reload: async () => undefined,
})

type AccessProviderProps = {
  children: ReactNode
}

/**
 * Uma leitura de `/members/{uid}` por sessão, não uma por componente. Além do
 * custo, o hook cria o pedido de acesso quando o documento não existe — três
 * cópias dele disputando o primeiro login fariam três escritas do mesmo
 * documento.
 */
export function AccessProvider({ children }: AccessProviderProps) {
  return <AccessContext value={useAccessState()}>{children}</AccessContext>
}

export function useAccess() {
  return use(AccessContext)
}
