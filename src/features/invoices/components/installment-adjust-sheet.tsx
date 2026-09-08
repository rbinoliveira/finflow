'use client'

import { useEffect, useState } from 'react'

import type { CreditCard } from '@/features/cards/types/card.type'
import { useLedger } from '@/features/ledger/providers/ledger.provider'
import { BottomSheet } from '@/shared/components/bottom-sheet'
import { Button } from '@/shared/components/button'
import { DayPicker } from '@/shared/components/day-picker'
import { MonthSwitcher } from '@/shared/components/month-switcher'
import { daysInMonth } from '@/shared/utils/date.util'
import { formatMoney } from '@/shared/utils/money.util'

import type { Installment } from '../types/installment.type'
import { adjustInstallmentUseCase } from '../use-cases/installment-adjust.use-case'

type InstallmentAdjustSheetProps = {
  installment: Installment | null
  card: CreditCard
  onClose: () => void
}

export function InstallmentAdjustSheet({
  installment,
  card,
  onClose,
}: InstallmentAdjustSheetProps) {
  const { uid, reload } = useLedger()

  const [month, setMonth] = useState('')
  const [day, setDay] = useState(card.dueDay)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!installment) return

    setMonth(installment.invoiceMonth)
    setDay(Number(installment.dueDate.slice(8, 10)))
  }, [installment])

  const save = async () => {
    if (!uid || !installment) return

    setSaving(true)

    try {
      await adjustInstallmentUseCase(uid, installment, {
        invoiceMonth: month,
        dueDay: day,
      })
      await reload()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet
      open={installment !== null}
      title="Ajustar pagamento"
      description={
        installment
          ? `${installment.description} · parcela ${installment.number}/${installment.total} · ${formatMoney(installment.amountCents)}`
          : undefined
      }
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 pb-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-ink-muted text-[11px] font-medium tracking-wide uppercase">
            Fatura
          </span>
          {month && <MonthSwitcher month={month} onChange={setMonth} />}
        </div>

        <DayPicker
          label="Dia do pagamento"
          value={day}
          onChange={setDay}
          max={month ? daysInMonth(month) : 31}
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
