import type { SpendingSlice } from '@/features/ledger/types/ledger.type'
import { Card } from '@/shared/components/card'
import { EmptyState } from '@/shared/components/empty-state'
import { SectionHeader } from '@/shared/components/section-header'
import { formatMoney } from '@/shared/utils/money.util'

type DashboardSpendingBreakdownProps = {
  title: string
  description?: string
  spending: SpendingSlice[]
  emptyMessage: string
}

export function DashboardSpendingBreakdown({
  title,
  description,
  spending,
  emptyMessage,
}: DashboardSpendingBreakdownProps) {
  return (
    <section>
      <SectionHeader title={title} description={description} />

      {spending.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <Card className="flex flex-col gap-3.5 px-4 py-4">
          {spending.map((entry) => (
            <div key={entry.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-ink flex min-w-0 items-center gap-2 font-medium">
                  <span aria-hidden>{entry.emoji}</span>
                  <span className="truncate">{entry.name}</span>
                </span>
                <span className="numeric text-ink-muted flex shrink-0 items-baseline gap-2">
                  <span className="text-ink-faint">
                    {Math.round(entry.percent)}%
                  </span>
                  {formatMoney(entry.totalCents)}
                </span>
              </div>

              <div
                role="progressbar"
                aria-label={entry.name}
                aria-valuenow={Math.round(entry.percent)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1.5 w-full overflow-hidden rounded-full bg-white/8"
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, entry.percent))}%`,
                    backgroundColor: entry.color,
                  }}
                />
              </div>
            </div>
          ))}
        </Card>
      )}
    </section>
  )
}
