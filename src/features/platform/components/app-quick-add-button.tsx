'use client'

import { useState } from 'react'

import { PlusIcon } from '@/features/platform/components/app-navigation-icons'
import { AppQuickAddSheet } from '@/features/platform/components/app-quick-add-sheet'

export function AppQuickAddButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-label="Novo lançamento"
        onClick={() => setOpen(true)}
        className="bg-accent shadow-accent/20 absolute -top-7 right-5 z-10 flex size-14 items-center justify-center rounded-full text-[color:var(--color-base)] shadow-lg transition active:scale-95"
      >
        <PlusIcon className="size-6" />
      </button>

      <AppQuickAddSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
