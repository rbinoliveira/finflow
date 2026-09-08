'use client'

import { useEffect, useState } from 'react'

import { useLedger } from '@/features/ledger/providers/ledger.provider'
import { BottomSheet } from '@/shared/components/bottom-sheet'
import { Button } from '@/shared/components/button'
import { TextField } from '@/shared/components/text-field'
import { cn } from '@/shared/utils/cn.util'

import {
  CATEGORY_COLORS,
  CATEGORY_EMOJIS,
} from '../constants/categories.constants'
import type { Category, CategoryKind } from '../types/category.type'
import {
  createCategoryUseCase,
  updateCategoryUseCase,
} from '../use-cases/category-save.use-case'

type CategoryFormSheetProps = {
  open: boolean
  kind: CategoryKind
  category: Category | null
  onClose: () => void
  onRemove: (category: Category) => void
}

export function CategoryFormSheet({
  open,
  kind,
  category,
  onClose,
  onRemove,
}: CategoryFormSheetProps) {
  const { uid, reload } = useLedger()

  const [name, setName] = useState('')
  const [color, setColor] = useState(CATEGORY_COLORS[0])
  const [emoji, setEmoji] = useState(CATEGORY_EMOJIS[0])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return

    setName(category?.name ?? '')
    setColor(category?.color ?? CATEGORY_COLORS[0])
    setEmoji(category?.emoji ?? CATEGORY_EMOJIS[0])
    setError(null)
  }, [open, category])

  const save = async () => {
    if (!uid) return

    if (name.trim().length === 0) {
      setError('Dê um nome à categoria.')
      return
    }

    setSaving(true)

    const input = { name: name.trim(), kind, color, emoji }

    try {
      if (category) {
        await updateCategoryUseCase(uid, category, input)
      } else {
        await createCategoryUseCase(uid, input)
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
      title={category ? 'Editar categoria' : 'Nova categoria'}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 pb-5">
        <TextField
          label="Nome"
          placeholder="Mercado, academia, salário…"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={error ?? undefined}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-ink-muted text-[11px] font-medium tracking-wide uppercase">
            Ícone
          </span>
          <div
            role="radiogroup"
            aria-label="Ícone"
            className="border-line-strong bg-surf grid grid-cols-9 gap-1 rounded-xl border p-2"
          >
            {CATEGORY_EMOJIS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={option === emoji}
                aria-label={`Ícone ${option}`}
                onClick={() => setEmoji(option)}
                className={cn(
                  'rounded-lg py-1.5 text-base transition-colors',
                  option === emoji ? 'bg-accent/15' : 'hover:bg-white/6',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-ink-muted text-[11px] font-medium tracking-wide uppercase">
            Cor
          </span>
          <div
            role="radiogroup"
            aria-label="Cor"
            className="flex flex-wrap gap-2"
          >
            {CATEGORY_COLORS.map((option) => (
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

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={save} disabled={saving}>
            Salvar
          </Button>
        </div>

        {category && (
          <Button
            variant="ghost"
            className="text-danger"
            onClick={() => {
              onRemove(category)
              onClose()
            }}
          >
            Remover categoria
          </Button>
        )}
      </div>
    </BottomSheet>
  )
}
