'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { CARD_BRAND_LABEL } from '@/features/cards/constants/cards.constants'
import { useLedger } from '@/features/ledger/providers/ledger.provider'
import { APP_ROUTES } from '@/features/platform/constants/app-routes.constants'
import { Button } from '@/shared/components/button'
import { Card } from '@/shared/components/card'
import { DataHandler } from '@/shared/components/data-handler'
import { MonthSwitcher } from '@/shared/components/month-switcher'
import { StatNumber } from '@/shared/components/stat-number'
import { currentMonth, shortDateLabel } from '@/shared/utils/date.util'
import { formatMoney } from '@/shared/utils/money.util'

import { InstallmentAdjustSheet } from '../components/installment-adjust-sheet'
import { InvoiceInstallmentRow } from '../components/invoice-installment-row'
import { MESSAGE_EMPTY_INVOICE } from '../constants/invoices.constants'
import type { Installment } from '../types/installment.type'
import { setInstallmentsPaidUseCase } from '../use-cases/invoice-pay.use-case'
import { buildInvoice } from '../utils/invoice-build.util'

type CardInvoicePageProps = {
  cardId: string
}

export function CardInvoicePage({ cardId }: CardInvoicePageProps) {
  const { uid, cards, categories, installments, loading, error, reload } =
    useLedger()

  const [month, setMonth] = useState(currentMonth())
  const [adjusting, setAdjusting] = useState<Installment | null>(null)
  const [paying, setPaying] = useState(false)

  const card = cards.find((entry) => entry.id === cardId) ?? null

  const invoice = useMemo(
    () => (card ? buildInvoice(card, month, installments) : null),
    [card, month, installments],
  )

  if (!loading && !card) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-ink text-xl">Cartão não encontrado</h1>
        <Link href={APP_ROUTES.cards} className="text-accent text-sm">
          Voltar para cartões
        </Link>
      </div>
    )
  }

  const togglePaid = async () => {
    if (!uid || !invoice || invoice.installments.length === 0) return

    setPaying(true)

    try {
      await setInstallmentsPaidUseCase(uid, invoice.installments, !invoice.paid)
      await reload()
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-3">
        <Link
          href={APP_ROUTES.cards}
          className="text-ink-muted hover:text-ink text-xs font-medium"
        >
          ‹ Cartões
        </Link>

        <div className="flex items-center gap-3">
          <span
            aria-hidden
            style={{ backgroundColor: card?.color }}
            className="h-9 w-12 shrink-0 rounded-lg"
          />
          <div className="flex flex-col gap-0.5">
            <h1 className="text-ink text-xl">{card?.name}</h1>
            {card && (
              <span className="text-ink-faint text-[11px]">
                {CARD_BRAND_LABEL[card.brand]} · fecha dia {card.closingDay}
              </span>
            )}
          </div>
        </div>

        <MonthSwitcher month={month} onChange={setMonth} />
      </header>

      {invoice && (
        <Card className="flex items-center justify-between gap-3 px-4 py-4">
          <StatNumber
            value={formatMoney(invoice.totalCents)}
            label={`Fatura vence ${shortDateLabel(invoice.dueDate)}`}
          />
          {invoice.installments.length > 0 && (
            <Button
              variant={invoice.paid ? 'outline' : 'accent'}
              onClick={togglePaid}
              disabled={paying}
            >
              {invoice.paid ? 'Reabrir' : 'Marcar paga'}
            </Button>
          )}
        </Card>
      )}

      <DataHandler
        loading={loading}
        error={error}
        empty={!invoice || invoice.installments.length === 0}
        emptyMessage={MESSAGE_EMPTY_INVOICE}
        onTryAgain={reload}
      >
        <Card className="px-1 py-1">
          {invoice?.installments.map((installment) => (
            <InvoiceInstallmentRow
              key={installment.id}
              installment={installment}
              category={
                categories.find(
                  (category) => category.id === installment.categoryId,
                ) ?? null
              }
              onAdjust={setAdjusting}
            />
          ))}
        </Card>
      </DataHandler>

      {card && (
        <InstallmentAdjustSheet
          installment={adjusting}
          card={card}
          onClose={() => setAdjusting(null)}
        />
      )}
    </div>
  )
}
