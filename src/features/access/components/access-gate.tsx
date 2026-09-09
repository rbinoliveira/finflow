'use client'

import type { ReactNode } from 'react'

import { AppSplash } from '@/features/platform/components/app-splash'

import {
  BLOCKED_TITLE,
  MESSAGE_BLOCKED,
  MESSAGE_WAITING,
  WAITING_TITLE,
} from '../constants/access.constants'
import { useAccess } from '../providers/access.provider'
import { AccessNotice } from './access-notice'

type AccessGateProps = {
  children: ReactNode
}

export function AccessGate({ children }: AccessGateProps) {
  const { state } = useAccess()

  if (state === 'unknown') {
    return <AppSplash />
  }

  if (state === 'pending') {
    return <AccessNotice title={WAITING_TITLE} message={MESSAGE_WAITING} />
  }

  if (state === 'blocked') {
    return <AccessNotice title={BLOCKED_TITLE} message={MESSAGE_BLOCKED} />
  }

  return <>{children}</>
}
