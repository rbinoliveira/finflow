'use client'

import { useEffect, useState } from 'react'

import { useLedger } from '@/features/ledger/providers/ledger.provider'
import { BottomSheet } from '@/shared/components/bottom-sheet'
import { Button } from '@/shared/components/button'
import { DayPicker } from '@/shared/components/day-picker'
import { MoneyField } from '@/shared/components/money-field'
import { SelectField } from '@/shared/components/select-field'
import { TextField } from '@/shared/components/text-field'
import { cn } from '@/shared/utils/cn.util'

import {
  CARD_BRAND_LABEL,
  CARD_BRANDS,
  CARD_COLORS,
  DEFAULT_CLOSING_DAY,
  DEFAULT_DUE_DAY,
} from '../constants/cards.constants'
import type { CardBrand, CreditCard } from '../types/card.type'
import {
  createCardUseCase,
  updateCardUseCase,
} from '../use-cases/card-save.use-case'

type CardFormSheetProps = {
  open: boolean
  card: CreditCard | null
  onClose: () => void
}

export function CardFormSheet({ open, card, onClose }: CardFormSheetProps) {
  const { uid, reload } = useLedger()

  const [name, setName] = useState('')
  const [brand, setBrand] = useState<CardBrand>('visa')
  const [color, setColor] = useState(CARD_COLORS[0])
  const [limitCents, setLimitCents] = useState(0)
  const [closingDay, setClosingDay] = useState(DEFAULT_CLOSING_DAY)
  const [dueDay, setDueDay] = useState(DEFAULT_DUE_DAY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    setName(card?.name ?? '')
    setBrand(card?.brand ?? 'visa')
    setColor(card?.color ?? CARD_COLORS[0])
    setLimitCents(card?.limitCents ?? 0)
    setClosingDay(card?.closingDay ?? DEFAULT_CLOSING_DAY)
    setDueDay(card?.dueDay ?? DEFAULT_DUE_DAY)
    setError(null)
  }, [open, card])

  const save = async () => {
    if (!uid) return

    if (name.trim().length === 0) {
      setError('Dê um nome ao cartão.')
      return
    }

    setSaving(true)

    const input = {
      name: name.trim(),
      brand,
      color,
      limitCents,
      closingDay,
      dueDay,
    }

    try {
      if (card) {
        await updateCardUseCase(uid, card, input)
      } else {
        await createCardUseCase(uid, input)
      }

      await reload()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet
      open={open}
      title={card ? 'Editar cartão' : 'Novo cartão'}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 pb-5">
        <TextField
          label="Nome"
          placeholder="Nubank, Inter, Itaú…"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={error ?? undefined}
        />

        <SelectField
          label="Bandeira"
          value={brand}
          onChange={(event) => setBrand(event.target.value as CardBrand)}
          options={CARD_BRANDS.map((option) => ({
            value: option,
            label: CARD_BRAND_LABEL[option],
          }))}
        />

        <MoneyField
          label="Limite"
          value={limitCents}
          onChange={setLimitCents}
          hint="Use zero se não quiser acompanhar o limite."
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-ink-muted text-[11px] font-medium tracking-wide uppercase">
            Cor
          </span>
          <div
            role="radiogroup"
            aria-label="Cor"
            className="flex flex-wrap gap-2"
          >
            {CARD_COLORS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={option === color}
                aria-label={`Cor ${option}`}
                onClick={() => setColor(option)}
                style={{ backgroundColor: option }}
                className={cn(
                  'size-8 rounded-full transition',
                  option === color
                    ? 'ring-ink ring-2 ring-offset-2 ring-offset-[color:var(--color-card)]'
                    : 'opacity-70 hover:opacity-100',
                )}
              />
            ))}
          </div>
        </div>

        <DayPicker
          label="Dia de fechamento"
          value={closingDay}
          onChange={setClosingDay}
          hint="Compras a partir deste dia entram na próxima fatura."
        />

        <DayPicker
          label="Dia de vencimento"
          value={dueDay}
          onChange={setDueDay}
        />

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={save} disabled={saving}>
            Salvar
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
