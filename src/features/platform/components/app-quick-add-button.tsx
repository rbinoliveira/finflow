'use client'

import { PlusIcon } from '@/features/platform/components/app-navigation-icons'
import { useTransactionComposer } from '@/features/transactions/providers/transaction-composer.provider'

export function AppQuickAddButton() {
  const { openComposer } = useTransactionComposer()

  return (
    <button
      type="button"
      aria-label="Novo lançamento"
      onClick={() => openComposer('expense')}
      className="bg-accent shadow-accent/20 absolute -top-7 right-5 z-10 flex size-14 items-center justify-center rounded-full text-[color:var(--color-base)] shadow-lg transition active:scale-95"
    >
      <PlusIcon className="size-6" />
    </button>
  )
}
