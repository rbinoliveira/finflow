'use client'

import { StatNumber } from '@/shared/components/stat-number'
import { formatMoney } from '@/shared/utils/money.util'

import type { RecurrenceTotals } from '../types/recurrence.type'

type RecurrencesSummaryProps = {
  totals: RecurrenceTotals
}

export function RecurrencesSummary({ totals }: RecurrencesSummaryProps) {
  return (
    <div className="border-line bg-card grid grid-cols-3 gap-3 rounded-2xl border px-4 py-4">
      <StatNumber
        value={formatMoney(totals.totalCents)}
        label="Previsto no mês"
        valueClassName="text-lg"
      />
      <StatNumber
        value={formatMoney(totals.paidCents)}
        label="Já pago"
        valueClassName="text-income text-lg"
      />
      <StatNumber
        value={formatMoney(totals.openCents)}
        label="Em aberto"
        valueClassName="text-expense text-lg"
      />
    </div>
  )
}
