'use client'

import { useMemo, useState } from 'react'

import { useLedger } from '@/features/ledger/providers/ledger.provider'
import {
  groupByDay,
  summarizeMonth,
  transactionsOfMonth,
} from '@/features/ledger/utils/ledger-summary.util'
import { DataHandler } from '@/shared/components/data-handler'
import { MonthSwitcher } from '@/shared/components/month-switcher'
import { StatNumber } from '@/shared/components/stat-number'
import { currentMonth } from '@/shared/utils/date.util'
import { formatMoney } from '@/shared/utils/money.util'

import { TransactionActionsSheet } from '../components/transaction-actions-sheet'
import { TransactionDayGroup } from '../components/transaction-day-group'
import {
  type TransactionFilter,
  TransactionsFilters,
} from '../components/transactions-filters'
import { MESSAGE_NO_TRANSACTIONS } from '../constants/transactions.constants'
import { useTransactionComposer } from '../providers/transaction-composer.provider'
import type { Transaction } from '../types/transaction.type'

export function TransactionsPage() {
  const { transactions, categories, cards, loading, error, reload } =
    useLedger()
  const { editTransaction } = useTransactionComposer()

  const [month, setMonth] = useState(currentMonth())
  const [kind, setKind] = useState<TransactionFilter>('all')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Transaction | null>(null)

  const doMes = useMemo(
    () => transactionsOfMonth(transactions, month),
    [transactions, month],
  )

  const filtradas = useMemo(
    () =>
      doMes
        .filter((transaction) => kind === 'all' || transaction.kind === kind)
        .filter(
          (transaction) =>
            categoryId === null || transaction.categoryId === categoryId,
        ),
    [doMes, kind, categoryId],
  )

  const summary = useMemo(() => summarizeMonth(filtradas), [filtradas])
  const grupos = useMemo(() => groupByDay(filtradas), [filtradas])

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-3">
        <h1 className="text-ink text-xl">Lançamentos</h1>
        <MonthSwitcher month={month} onChange={setMonth} />
      </header>

      <div className="border-line bg-card grid grid-cols-3 gap-3 rounded-2xl border px-4 py-4">
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
        <StatNumber
          value={formatMoney(summary.balanceCents)}
          label="Saldo"
          valueClassName="text-lg"
        />
      </div>

      <TransactionsFilters
        kind={kind}
        categoryId={categoryId}
        categories={categories}
        onKindChange={(next) => {
          setKind(next)
          setCategoryId(null)
        }}
        onCategoryChange={setCategoryId}
      />

      <DataHandler
        loading={loading}
        error={error}
        empty={grupos.length === 0}
        emptyMessage={MESSAGE_NO_TRANSACTIONS}
        onTryAgain={reload}
      >
        <div className="flex flex-col gap-5">
          {grupos.map((grupo) => (
            <TransactionDayGroup
              key={grupo.date}
              date={grupo.date}
              totalCents={grupo.totalCents}
              transactions={grupo.transactions}
              categories={categories}
              cards={cards}
              onSelect={setSelected}
            />
          ))}
        </div>
      </DataHandler>

      <TransactionActionsSheet
        transaction={selected}
        onClose={() => setSelected(null)}
        onEdit={editTransaction}
      />
    </div>
  )
}
