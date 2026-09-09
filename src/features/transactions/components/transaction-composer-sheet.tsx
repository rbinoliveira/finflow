'use client'

import { useState } from 'react'

import { RecurrenceForm } from '@/features/recurrences/components/recurrence-form'
import { RecurrenceRemoveDialog } from '@/features/recurrences/components/recurrence-remove-dialog'
import type { Recurrence } from '@/features/recurrences/types/recurrence.type'
import { BottomSheet } from '@/shared/components/bottom-sheet'
import { SegmentedControl } from '@/shared/components/segmented-control'

import {
  COMPOSER_EDIT_TITLE,
  COMPOSER_MODE_HINT,
  COMPOSER_MODE_LABEL,
  COMPOSER_TITLE,
} from '../constants/transactions.constants'
import type {
  ComposerMode,
  Transaction,
  TransactionKind,
} from '../types/transaction.type'
import { TransactionForm } from './transaction-form'

type TransactionComposerSheetProps = {
  open: boolean
  mode: ComposerMode
  kind: TransactionKind
  transaction: Transaction | null
  recurrence: Recurrence | null
  onModeChange: (mode: ComposerMode) => void
  onClose: () => void
}

export function TransactionComposerSheet({
  open,
  mode,
  kind,
  transaction,
  recurrence,
  onModeChange,
  onClose,
}: TransactionComposerSheetProps) {
  const [removing, setRemoving] = useState<Recurrence | null>(null)

  const editando = transaction !== null || recurrence !== null
  const titulo = editando
    ? COMPOSER_EDIT_TITLE[mode]
    : COMPOSER_TITLE[mode][kind]

  return (
    <>
      <BottomSheet
        open={open}
        title={titulo}
        description={editando ? undefined : COMPOSER_MODE_HINT[mode]}
        onClose={onClose}
      >
        {/* Trocar entre lançamento e regra só faz sentido no que ainda não
            existe: o que já foi salvo é de um tipo ou de outro, e converter
            seria apagar um para criar o outro. */}
        {!editando && (
          <div className="pb-4">
            <SegmentedControl<ComposerMode>
              label="Tipo de cadastro"
              value={mode}
              onChange={onModeChange}
              options={[
                { value: 'single', label: COMPOSER_MODE_LABEL.single },
                { value: 'recurring', label: COMPOSER_MODE_LABEL.recurring },
              ]}
            />
          </div>
        )}

        {mode === 'single' ? (
          <TransactionForm
            kind={kind}
            transaction={transaction}
            onDone={onClose}
          />
        ) : (
          <RecurrenceForm
            kind={kind}
            recurrence={recurrence}
            onDone={onClose}
            onRemove={(selected) => {
              onClose()
              setRemoving(selected)
            }}
          />
        )}
      </BottomSheet>

      <RecurrenceRemoveDialog
        recurrence={removing}
        onClose={() => setRemoving(null)}
      />
    </>
  )
}
