'use client'

import { useState } from 'react'

import type { CreditCard } from '@/features/cards/types/card.type'
import {
  invoiceDueDate,
  invoiceMonthChoices,
} from '@/features/invoices/utils/invoice-allocation.util'
import { Calendar } from '@/shared/components/calendar'
import { FieldShell } from '@/shared/components/field-shell'
import { cn } from '@/shared/utils/cn.util'
import { shortDateLabel, shortMonthLabel } from '@/shared/utils/date.util'

type TransactionPaymentFieldProps = {
  value: string | null
  onChange: (paymentDate: string | null) => void
  card: CreditCard
  purchaseDate: string
  installments: number
  error?: string
}

export function TransactionPaymentField({
  value,
  onChange,
  card,
  purchaseDate,
  installments,
  error,
}: TransactionPaymentFieldProps) {
  const faturas = invoiceMonthChoices(
    purchaseDate,
    card.closingDay,
    card.dueDay,
  ).map((month) => ({
    month,
    date: invoiceDueDate(month, card.dueDay),
  }))

  const efetiva = value ?? faturas[0].date
  const naLista = faturas.some((fatura) => fatura.date === efetiva)

  const [aberto, setAberto] = useState(!naLista)

  const parcelado = installments > 1

  return (
    <FieldShell
      label={parcelado ? 'Pagamento da 1ª parcela' : 'Data do pagamento'}
      error={error}
      hint={
        parcelado
          ? `As outras ${installments - 1} seguem no mesmo dia dos meses seguintes.`
          : 'A fatura em que a compra caiu — dá para empurrar para a próxima.'
      }
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {faturas.map((fatura) => {
            const active = efetiva === fatura.date

            return (
              <button
                key={fatura.month}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  onChange(fatura.date === faturas[0].date ? null : fatura.date)
                  setAberto(false)
                }}
                className={cn(
                  'rounded-full border px-3 py-2 text-xs font-medium transition-colors',
                  active
                    ? 'bg-accent/12 text-accent border-transparent'
                    : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
                )}
              >
                {shortMonthLabel(fatura.month)} · {shortDateLabel(fatura.date)}
              </button>
            )
          })}

          <button
            type="button"
            aria-expanded={aberto}
            onClick={() => setAberto((atual) => !atual)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-2',
              'text-xs font-medium transition-colors',
              !naLista
                ? 'bg-accent/12 text-accent border-transparent'
                : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
            )}
          >
            <span aria-hidden>📅</span>
            {naLista ? 'Outro dia' : shortDateLabel(efetiva)}
          </button>
        </div>

        {aberto && (
          <Calendar value={efetiva} onChange={(date) => onChange(date)} />
        )}
      </div>
    </FieldShell>
  )
}
