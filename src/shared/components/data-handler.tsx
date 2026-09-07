'use client'

import type { ReactNode } from 'react'

import { EmptyState } from '@/shared/components/empty-state'
import { ErrorState } from '@/shared/components/error-state'
import { SkeletonList } from '@/shared/components/skeleton'

type DataHandlerProps = {
  loading: boolean
  error: string | null
  empty: boolean
  emptyMessage: string
  emptyAction?: ReactNode
  skeletonRows?: number
  onTryAgain?: () => void
  children: ReactNode
}

export function DataHandler({
  loading,
  error,
  empty,
  emptyMessage,
  emptyAction,
  skeletonRows,
  onTryAgain,
  children,
}: DataHandlerProps) {
  if (loading) return <SkeletonList rows={skeletonRows} />

  if (error) return <ErrorState message={error} onTryAgain={onTryAgain} />

  if (empty) return <EmptyState message={emptyMessage} action={emptyAction} />

  return <>{children}</>
}
