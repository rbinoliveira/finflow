'use client'

import { useMemo, useState } from 'react'

import { useLedger } from '@/features/ledger/providers/ledger.provider'
import { Button } from '@/shared/components/button'
import { DataHandler } from '@/shared/components/data-handler'

import { CardFormSheet } from '../components/card-form-sheet'
import { CardItem } from '../components/card-item'
import { MESSAGE_NO_CARDS } from '../constants/cards.constants'
import type { CreditCard } from '../types/card.type'
import { buildCardUsage } from '../utils/card-usage.util'

export function CardsPage() {
  const { cards, installments, loading, error, reload } = useLedger()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CreditCard | null>(null)

  const usages = useMemo(
    () => cards.map((card) => buildCardUsage(card, installments)),
    [cards, installments],
  )

  const openNew = () => {
    setEditing(null)
    setOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-ink text-xl">Cartões</h1>
        <Button variant="surface" onClick={openNew}>
          Novo cartão
        </Button>
      </header>

      <DataHandler
        loading={loading}
        error={error}
        empty={usages.length === 0}
        emptyMessage={MESSAGE_NO_CARDS}
        emptyAction={<Button onClick={openNew}>Cadastrar cartão</Button>}
        onTryAgain={reload}
      >
        <div className="flex flex-col gap-3">
          {usages.map((usage) => (
            <CardItem
              key={usage.card.id}
              usage={usage}
              onEdit={() => {
                setEditing(usage.card)
                setOpen(true)
              }}
            />
          ))}
        </div>
      </DataHandler>

      <CardFormSheet
        open={open}
        card={editing}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}
