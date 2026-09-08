'use client'

import type { Category } from '@/features/categories/types/category.type'
import { RecurrenceBillsList } from '@/features/recurrences/components/recurrence-bills-list'
import { OPEN_BILLS_TITLE } from '@/features/recurrences/constants/recurrences.constants'
import type { RecurrenceBill } from '@/features/recurrences/types/recurrence.type'
import { SectionHeader } from '@/shared/components/section-header'
import { formatMoney } from '@/shared/utils/money.util'

type DashboardOpenBillsProps = {
  bills: RecurrenceBill[]
  categories: Category[]
  onSelect: (bill: RecurrenceBill) => void
}

export function DashboardOpenBills({
  bills,
  categories,
  onSelect,
}: DashboardOpenBillsProps) {
  if (bills.length === 0) return null

  const total = bills.reduce((soma, bill) => soma + bill.amountCents, 0)

  return (
    <section>
      <SectionHeader
        title={OPEN_BILLS_TITLE}
        description={`${bills.length} a pagar · ${formatMoney(total)}`}
      />

      <RecurrenceBillsList
        bills={bills}
        categories={categories}
        showMonth
        onSelect={onSelect}
      />
    </section>
  )
}
