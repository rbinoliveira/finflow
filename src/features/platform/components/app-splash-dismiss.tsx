'use client'

import { useEffect } from 'react'

import { APP_READY_ATTRIBUTE } from '@/features/platform/constants/app-identity.constants'

/**
 * Some com a splash do HTML assim que o React assume. A partir daí quem cobre
 * a espera é a splash das portas — a mesma imagem, agora dentro da árvore.
 */
export function AppSplashDismiss() {
  useEffect(() => {
    document.documentElement.setAttribute(APP_READY_ATTRIBUTE, 'true')
  }, [])

  return null
}
