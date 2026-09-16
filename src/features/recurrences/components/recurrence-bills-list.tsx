'use client'

import type { Category } from '@/features/categories/types/category.type'
import { Card } from '@/shared/components/card'

import type { RecurrenceBill } from '../types/recurrence.type'
import { RecurrenceBillRow } from './recurrence-bill-row'

type RecurrenceBillsListProps = {
  bills: RecurrenceBill[]
  categories: Category[]
  showMonth?: boolean
  showRecurring?: boolean
  onSelect: (bill: RecurrenceBill) => void
}

export function RecurrenceBillsList({
  bills,
  categories,
  showMonth,
  showRecurring,
  onSelect,
}: RecurrenceBillsListProps) {
  return (
    <Card className="px-1 py-1">
      {bills.map((bill) => (
        <RecurrenceBillRow
          key={`${bill.recurrence.id}-${bill.month}`}
          bill={bill}
          category={
            categories.find(
              (category) => category.id === bill.recurrence.categoryId,
            ) ?? null
          }
          showMonth={showMonth}
          showRecurring={showRecurring}
          onSelect={onSelect}
        />
      ))}
    </Card>
  )
}
