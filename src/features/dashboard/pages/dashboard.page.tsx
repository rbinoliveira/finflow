'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { listOpenInvoices } from '@/features/invoices/utils/invoice-build.util'
import { useLedger } from '@/features/ledger/providers/ledger.provider'
import {
  spendingByCategory,
  spendingBySource,
  summarizeMonth,
  transactionsOfMonth,
} from '@/features/ledger/utils/ledger-summary.util'
import { APP_ROUTES } from '@/features/platform/constants/app-routes.constants'
import { useFirebaseAuth } from '@/features/platform/providers/firebase-auth.provider'
import { TransactionActionsSheet } from '@/features/transactions/components/transaction-actions-sheet'
import { TransactionRow } from '@/features/transactions/components/transaction-row'
import { useTransactionComposer } from '@/features/transactions/providers/transaction-composer.provider'
import type { Transaction } from '@/features/transactions/types/transaction.type'
import { Card } from '@/shared/components/card'
import { DataHandler } from '@/shared/components/data-handler'
import { MonthSwitcher } from '@/shared/components/month-switcher'
import { SectionHeader } from '@/shared/components/section-header'
import { currentMonth } from '@/shared/utils/date.util'

import { DashboardOpenInvoices } from '../components/dashboard-open-invoices'
import { DashboardSpendingBreakdown } from '../components/dashboard-spending-breakdown'
import { DashboardSummary } from '../components/dashboard-summary'
import {
  BREAKDOWN_LIMIT,
  CATEGORY_BREAKDOWN_TITLE,
  MESSAGE_EMPTY_MONTH,
  MESSAGE_NO_SPENDING,
  RECENT_TRANSACTIONS_LIMIT,
  SOURCE_BREAKDOWN_DESCRIPTION,
  SOURCE_BREAKDOWN_TITLE,
} from '../constants/dashboard.constants'

export function DashboardPage() {
  const {
    transactions,
    categories,
    cards,
    installments,
    loading,
    error,
    reload,
  } = useLedger()
  const { user } = useFirebaseAuth()
  const { editTransaction } = useTransactionComposer()

  const [month, setMonth] = useState(currentMonth())
  const [selected, setSelected] = useState<Transaction | null>(null)

  const doMes = useMemo(
    () => transactionsOfMonth(transactions, month),
    [transactions, month],
  )

  const summary = useMemo(() => summarizeMonth(doMes), [doMes])
  const spending = useMemo(
    () => spendingByCategory(doMes, categories).slice(0, BREAKDOWN_LIMIT),
    [doMes, categories],
  )
  const bySource = useMemo(
    () => spendingBySource(doMes, cards).slice(0, BREAKDOWN_LIMIT),
    [doMes, cards],
  )
  const openInvoices = useMemo(
    () => listOpenInvoices(cards, installments),
    [cards, installments],
  )

  const recentes = doMes.slice(0, RECENT_TRANSACTIONS_LIMIT)
  const primeiroNome = user?.displayName?.split(' ')[0]

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-ink-faint text-xs">
            {primeiroNome ? `Olá, ${primeiroNome}` : 'Olá'}
          </span>
          <h1 className="text-ink text-xl">Seu mês</h1>
        </div>
        <MonthSwitcher month={month} onChange={setMonth} />
      </header>

      <DashboardSummary summary={summary} />

      <DashboardOpenInvoices invoices={openInvoices} cards={cards} />

      <DashboardSpendingBreakdown
        title={SOURCE_BREAKDOWN_TITLE}
        description={SOURCE_BREAKDOWN_DESCRIPTION}
        spending={bySource}
        emptyMessage={MESSAGE_NO_SPENDING}
      />

      <DashboardSpendingBreakdown
        title={CATEGORY_BREAKDOWN_TITLE}
        spending={spending}
        emptyMessage={MESSAGE_NO_SPENDING}
      />

      <section>
        <SectionHeader
          title="Últimos lançamentos"
          action={
            <Link
              href={APP_ROUTES.transactions}
              className="text-accent text-xs font-medium"
            >
              Ver todos
            </Link>
          }
        />

        <DataHandler
          loading={loading}
          error={error}
          empty={recentes.length === 0}
          emptyMessage={MESSAGE_EMPTY_MONTH}
          skeletonRows={3}
          onTryAgain={reload}
        >
          <Card className="px-1 py-1">
            {recentes.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                category={
                  categories.find(
                    (category) => category.id === transaction.categoryId,
                  ) ?? null
                }
                cardName={
                  cards.find((card) => card.id === transaction.cardId)?.name ??
                  null
                }
                onSelect={setSelected}
              />
            ))}
          </Card>
        </DataHandler>
      </section>

      <TransactionActionsSheet
        transaction={selected}
        onClose={() => setSelected(null)}
        onEdit={editTransaction}
      />
    </div>
  )
}
