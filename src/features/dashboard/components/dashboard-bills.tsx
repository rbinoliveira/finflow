'use client'

import type { Category } from '@/features/categories/types/category.type'
import type { RecurrenceBill } from '@/features/recurrences/types/recurrence.type'
import { Card } from '@/shared/components/card'

import {
  MESSAGE_BILLS_UP_TO_DATE,
  MESSAGE_BILLS_UP_TO_DATE_HINT,
} from '../constants/dashboard.constants'
import { DashboardOpenBills } from './dashboard-open-bills'

type DashboardBillsProps = {
  bills: RecurrenceBill[]
  categories: Category[]
  loading: boolean
  onSelect: (bill: RecurrenceBill) => void
}

export function DashboardBills({
  bills,
  categories,
  loading,
  onSelect,
}: DashboardBillsProps) {
  if (loading) return null

  if (bills.length === 0) {
    return (
      <Card className="flex items-center gap-3 px-4 py-3.5">
        <span
          aria-hidden
          className="text-income flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm"
        >
          ✓
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-ink text-sm font-medium">
            {MESSAGE_BILLS_UP_TO_DATE}
          </span>
          <span className="text-ink-faint text-xs">
            {MESSAGE_BILLS_UP_TO_DATE_HINT}
          </span>
        </span>
      </Card>
    )
  }

  return (
    <>
      <DashboardOpenBills
        bills={bills}
        kind="expense"
        categories={categories}
        onSelect={onSelect}
      />

      <DashboardOpenBills
        bills={bills}
        kind="income"
        categories={categories}
        onSelect={onSelect}
      />
    </>
  )
}
