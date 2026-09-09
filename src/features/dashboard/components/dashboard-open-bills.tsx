'use client'

import type { Category } from '@/features/categories/types/category.type'
import { RecurrenceBillsList } from '@/features/recurrences/components/recurrence-bills-list'
import { BILL_COPY } from '@/features/recurrences/constants/recurrences.constants'
import type { RecurrenceBill } from '@/features/recurrences/types/recurrence.type'
import type { TransactionKind } from '@/features/transactions/types/transaction.type'
import { SectionHeader } from '@/shared/components/section-header'
import { formatMoney } from '@/shared/utils/money.util'

type DashboardOpenBillsProps = {
  bills: RecurrenceBill[]
  kind: TransactionKind
  categories: Category[]
  onSelect: (bill: RecurrenceBill) => void
}

export function DashboardOpenBills({
  bills,
  kind,
  categories,
  onSelect,
}: DashboardOpenBillsProps) {
  const doTipo = bills.filter((bill) => bill.recurrence.kind === kind)

  if (doTipo.length === 0) return null

  const copy = BILL_COPY[kind]
  const total = doTipo.reduce((soma, bill) => soma + bill.amountCents, 0)

  return (
    <section>
      <SectionHeader
        title={copy.openTitle}
        description={`${doTipo.length} ${copy.openCount} · ${formatMoney(total)}`}
      />

      <RecurrenceBillsList
        bills={doTipo}
        categories={categories}
        showMonth
        onSelect={onSelect}
      />
    </section>
  )
}
