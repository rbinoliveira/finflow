'use client'

import { useEffect, useState } from 'react'

import { useLedger } from '@/features/ledger/providers/ledger.provider'
import { useTransactionComposer } from '@/features/transactions/providers/transaction-composer.provider'
import { BottomSheet } from '@/shared/components/bottom-sheet'
import { Button } from '@/shared/components/button'
import { MoneyField } from '@/shared/components/money-field'
import { monthLabel, shortDateLabel } from '@/shared/utils/date.util'

import { BILL_COPY } from '../constants/recurrences.constants'
import type { Recurrence, RecurrenceBill } from '../types/recurrence.type'
import {
  payRecurrenceBillUseCase,
  unpayRecurrenceBillUseCase,
} from '../use-cases/recurrence-pay.use-case'
import { RecurrenceRemoveDialog } from './recurrence-remove-dialog'

type RecurrenceBillSheetProps = {
  bill: RecurrenceBill | null
  /** Mexer na regra é coisa de Lançamentos; o Início só quita. */
  manageable?: boolean
  onClose: () => void
}

export function RecurrenceBillSheet({
  bill,
  manageable = false,
  onClose,
}: RecurrenceBillSheetProps) {
  const { uid, cards, installments, reload } = useLedger()
  const { editRecurrence } = useTransactionComposer()

  const [removing, setRemoving] = useState<Recurrence | null>(null)

  const [amountCents, setAmountCents] = useState(0)
  const [saving, setSaving] = useState(false)

  const copy = BILL_COPY[bill?.recurrence.kind ?? 'expense']

  useEffect(() => {
    if (bill) setAmountCents(bill.amountCents)
  }, [bill])

  const pagar = async () => {
    if (!uid || !bill) return

    setSaving(true)

    try {
      await payRecurrenceBillUseCase(uid, bill, amountCents, {
        cards,
        installments,
      })
      await reload()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const desfazer = async () => {
    if (!uid || !bill) return

    setSaving(true)

    try {
      await unpayRecurrenceBillUseCase(uid, bill, installments)
      await reload()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <BottomSheet
        open={bill !== null}
        title={bill?.recurrence.description ?? ''}
        description={
          bill
            ? `${monthLabel(bill.month)} · ${copy.due} ${shortDateLabel(bill.dueDate)}`
            : undefined
        }
        onClose={onClose}
      >
        <div className="flex flex-col gap-4 pb-5">
          {bill?.paid ? (
            <>
              <p className="text-ink-muted text-sm">{copy.undoHint}</p>
              <Button variant="danger" onClick={desfazer} disabled={saving}>
                {copy.undo}
              </Button>
            </>
          ) : (
            <>
              <MoneyField
                large
                label={copy.amountLabel}
                value={amountCents}
                onChange={setAmountCents}
                hint={copy.amountHint}
              />
              <Button onClick={pagar} disabled={saving || amountCents <= 0}>
                {copy.confirm}
              </Button>
            </>
          )}

          {manageable && bill && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  editRecurrence(bill.recurrence)
                  onClose()
                }}
              >
                Editar recorrência
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setRemoving(bill.recurrence)
                  onClose()
                }}
              >
                Excluir recorrência
              </Button>
            </>
          )}

          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </BottomSheet>

      <RecurrenceRemoveDialog
        recurrence={removing}
        onClose={() => setRemoving(null)}
      />
    </>
  )
}
