import type { CategorySpending } from '@/features/ledger/types/ledger.type'
import { Card } from '@/shared/components/card'
import { EmptyState } from '@/shared/components/empty-state'
import { ProgressBar } from '@/shared/components/progress-bar'
import { SectionHeader } from '@/shared/components/section-header'
import { formatMoney } from '@/shared/utils/money.util'

import { MESSAGE_NO_SPENDING } from '../constants/dashboard.constants'

type DashboardCategoryBreakdownProps = {
  spending: CategorySpending[]
}

export function DashboardCategoryBreakdown({
  spending,
}: DashboardCategoryBreakdownProps) {
  return (
    <section>
      <SectionHeader title="Gasto por categoria" />

      {spending.length === 0 ? (
        <EmptyState message={MESSAGE_NO_SPENDING} />
      ) : (
        <Card className="flex flex-col gap-3.5 px-4 py-4">
          {spending.map((entry) => (
            <div
              key={entry.categoryId ?? 'none'}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-ink flex items-center gap-2 font-medium">
                  <span aria-hidden>{entry.emoji}</span>
                  {entry.name}
                </span>
                <span className="numeric text-ink-muted">
                  {formatMoney(entry.totalCents)}
                </span>
              </div>
              <ProgressBar
                value={entry.percent}
                barClassName="bg-[color:var(--bar-color)]"
                className="[--bar-color:var(--color-accent)]"
              />
            </div>
          ))}
        </Card>
      )}
    </section>
  )
}
