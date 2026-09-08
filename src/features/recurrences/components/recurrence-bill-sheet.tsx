'use client'

import { useEffect, useState } from 'react'

import { useLedger } from '@/features/ledger/providers/ledger.provider'
import { BottomSheet } from '@/shared/components/bottom-sheet'
import { Button } from '@/shared/components/button'
import { MoneyField } from '@/shared/components/money-field'
import { monthLabel, shortDateLabel } from '@/shared/utils/date.util'

import type { RecurrenceBill } from '../types/recurrence.type'
import {
  payRecurrenceBillUseCase,
  unpayRecurrenceBillUseCase,
} from '../use-cases/recurrence-pay.use-case'

type RecurrenceBillSheetProps = {
  bill: RecurrenceBill | null
  onClose: () => void
}

export function RecurrenceBillSheet({
  bill,
  onClose,
}: RecurrenceBillSheetProps) {
  const { uid, cards, installments, reload } = useLedger()

  const [amountCents, setAmountCents] = useState(0)
  const [saving, setSaving] = useState(false)

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
    <BottomSheet
      open={bill !== null}
      title={bill?.recurrence.description ?? ''}
      description={
        bill
          ? `${monthLabel(bill.month)} · vence ${shortDateLabel(bill.dueDate)}`
          : undefined
      }
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 pb-5">
        {bill?.paid ? (
          <>
            <p className="text-ink-muted text-sm">
              Esta conta já está paga e virou lançamento no mês dela. Desfazer
              apaga esse lançamento e a conta volta para o aberto.
            </p>
            <Button variant="danger" onClick={desfazer} disabled={saving}>
              Desfazer pagamento
            </Button>
          </>
        ) : (
          <>
            <MoneyField
              large
              label="Valor pago"
              value={amountCents}
              onChange={setAmountCents}
              hint="Ajuste se a conta veio diferente do previsto."
            />
            <Button onClick={pagar} disabled={saving || amountCents <= 0}>
              Marcar como paga
            </Button>
          </>
        )}

        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </BottomSheet>
  )
}
