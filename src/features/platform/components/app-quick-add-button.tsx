'use client'

import { useState } from 'react'

import { PlusIcon } from '@/features/platform/components/app-navigation-icons'
import { AppQuickAddSheet } from '@/features/platform/components/app-quick-add-sheet'

/**
 * O botão ocupa a própria coluna da barra em vez de flutuar sobre ela. Ancorado
 * por coordenada à direita, ele caía em cima do último item: os dois alvos de
 * toque se sobrepunham e quem mirava Ajustes abria o compositor.
 */
export function AppQuickAddButton() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-start justify-center">
      <button
        type="button"
        aria-label="Novo lançamento"
        onClick={() => setOpen(true)}
        className="bg-accent shadow-accent/20 -mt-7 flex size-14 items-center justify-center rounded-full text-[color:var(--color-base)] shadow-lg transition active:scale-95"
      >
        <PlusIcon className="size-6" />
      </button>

      <AppQuickAddSheet open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
