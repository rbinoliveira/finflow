'use client'

import { useCallback, useEffect, useState } from 'react'

import { useFirebaseAuth } from '@/features/platform/providers/firebase-auth.provider'

import type { AccessState } from '../types/access.type'
import { getMemberUseCase } from '../use-cases/member-get.use-case'
import { requestAccessUseCase } from '../use-cases/member-request.use-case'
import { isAdminEmail } from '../utils/admin-email.util'

/**
 * Situação de acesso de quem está logado. O admin não passa por `/members`:
 * ele não libera a si mesmo, e as regras já o tratam à parte — pedir um
 * documento que ele nunca vai ter só adiaria a tela dele.
 */
export function useAccessState() {
  const { user } = useFirebaseAuth()
  const [state, setState] = useState<AccessState>('unknown')

  const load = useCallback(async () => {
    if (!user?.email) {
      setState('unknown')
      return
    }

    if (isAdminEmail(user.email)) {
      setState('approved')
      return
    }

    try {
      const member = await getMemberUseCase(user.uid)

      if (member) {
        setState(member.status)
        return
      }

      /* Primeiro login: o pedido nasce aqui, e não numa tela de cadastro —
         quem entrou já quis entrar. */
      await requestAccessUseCase(user.uid, user.email)
      setState('pending')
    } catch {
      /* Regra recusou a leitura ou a rede caiu: tratar como bloqueado é o lado
         seguro do erro — nunca liberar o app por falha. */
      setState('blocked')
    }
  }, [user])

  useEffect(() => {
    load().catch(() => undefined)
  }, [load])

  return { state, isAdmin: isAdminEmail(user?.email), reload: load }
}
