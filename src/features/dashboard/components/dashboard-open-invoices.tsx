import Link from 'next/link'

import type { CreditCard } from '@/features/cards/types/card.type'
import type { Invoice } from '@/features/invoices/types/installment.type'
import {
  invoiceDueSoon,
  invoiceOverdue,
} from '@/features/invoices/utils/invoice-build.util'
import { cardRoute } from '@/features/platform/constants/app-routes.constants'
import { Card } from '@/shared/components/card'
import { SectionHeader } from '@/shared/components/section-header'
import { Tag } from '@/shared/components/tag'
import { shortDateLabel } from '@/shared/utils/date.util'
import { formatMoney } from '@/shared/utils/money.util'

type DashboardOpenInvoicesProps = {
  invoices: Invoice[]
  cards: CreditCard[]
}

export function DashboardOpenInvoices({
  invoices,
  cards,
}: DashboardOpenInvoicesProps) {
  if (invoices.length === 0) return null

  return (
    <section>
      <SectionHeader title="Faturas em aberto" />

      <Card className="flex flex-col px-1 py-1">
        {invoices.map((invoice) => {
          const card = cards.find((entry) => entry.id === invoice.cardId)

          return (
            <Link
              key={`${invoice.cardId}-${invoice.month}`}
              href={cardRoute(invoice.cardId)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/3"
            >
              <span
                aria-hidden
                style={{ backgroundColor: card?.color }}
                className="h-7 w-10 shrink-0 rounded-md"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-ink truncate text-sm font-medium">
                  {card?.name}
                </span>
                <span className="text-ink-faint text-[11px]">
                  vence {shortDateLabel(invoice.dueDate)}
                </span>
              </span>

              {invoiceOverdue(invoice) && <Tag tone="danger">Vencida</Tag>}
              {!invoiceOverdue(invoice) && invoiceDueSoon(invoice) && (
                <Tag tone="warn">Perto</Tag>
              )}

              <span className="numeric text-ink shrink-0 text-sm font-semibold">
                {formatMoney(invoice.openCents)}
              </span>
            </Link>
          )
        })}
      </Card>
    </section>
  )
}
