'use client'

import { useTransactionComposer } from '@/features/transactions/providers/transaction-composer.provider'
import type { TransactionKind } from '@/features/transactions/types/transaction.type'
import { BottomSheet } from '@/shared/components/bottom-sheet'
import { Card } from '@/shared/components/card'
import { cn } from '@/shared/utils/cn.util'

type QuickAddOption = {
  kind: TransactionKind
  label: string
  hint: string
  emoji: string
  toneClass: string
}

const OPTIONS: QuickAddOption[] = [
  {
    kind: 'expense',
    label: 'Despesa',
    hint: 'Algo que saiu da conta',
    emoji: '💸',
    toneClass: 'text-expense',
  },
  {
    kind: 'income',
    label: 'Receita',
    hint: 'Algo que entrou — salário, freela',
    emoji: '💰',
    toneClass: 'text-income',
  },
]

type AppQuickAddSheetProps = {
  open: boolean
  onClose: () => void
}

export function AppQuickAddSheet({ open, onClose }: AppQuickAddSheetProps) {
  const { openComposer } = useTransactionComposer()

  return (
    <BottomSheet
      open={open}
      title="O que você quer lançar?"
      description="Depois dá para escolher entre único e recorrente."
      onClose={onClose}
    >
      <Card className="mb-5 px-1 py-1">
        {OPTIONS.map((option) => (
          <button
            key={option.kind}
            type="button"
            onClick={() => {
              onClose()
              openComposer(option.kind)
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left transition-colors hover:bg-white/3"
          >
            <span aria-hidden className="text-xl">
              {option.emoji}
            </span>
            <span className="flex flex-1 flex-col gap-0.5">
              <span className={cn('text-sm font-semibold', option.toneClass)}>
                {option.label}
              </span>
              <span className="text-ink-faint text-[11px]">{option.hint}</span>
            </span>
            <span aria-hidden className="text-ink-faint text-lg">
              ›
            </span>
          </button>
        ))}
      </Card>
    </BottomSheet>
  )
}
