import type { MonthSummary } from '@/features/ledger/types/ledger.type'
import { Card } from '@/shared/components/card'
import { StatNumber } from '@/shared/components/stat-number'
import { cn } from '@/shared/utils/cn.util'
import { formatMoney } from '@/shared/utils/money.util'

type DashboardSummaryProps = {
  summary: MonthSummary
}

export function DashboardSummary({ summary }: DashboardSummaryProps) {
  return (
    <Card className="flex flex-col gap-4 px-5 py-5">
      <div className="flex flex-col gap-1">
        <span className="text-ink-faint text-[11px] tracking-wide uppercase">
          Saldo do mês
        </span>
        <span
          className={cn(
            'numeric text-3xl leading-none font-semibold',
            summary.balanceCents >= 0 ? 'text-income' : 'text-expense',
          )}
        >
          {formatMoney(summary.balanceCents)}
        </span>
      </div>

      <div className="border-line grid grid-cols-2 gap-3 border-t pt-4">
        <StatNumber
          value={formatMoney(summary.incomeCents)}
          label="Receitas"
          valueClassName="text-income text-lg"
        />
        <StatNumber
          value={formatMoney(summary.expenseCents)}
          label="Despesas"
          valueClassName="text-expense text-lg"
        />
      </div>
    </Card>
  )
}
