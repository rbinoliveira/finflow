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
        value={formatMoney(totals.openIncomeCents)}
        label="A receber"
        valueClassName="text-income text-lg"
      />
      <StatNumber
        value={formatMoney(totals.openExpenseCents)}
        label="A pagar"
        valueClassName="text-expense text-lg"
      />
      <StatNumber
        value={formatMoney(totals.incomeCents - totals.expenseCents)}
        label="Sobra prevista"
        valueClassName="text-lg"
      />
    </div>
  )
}
