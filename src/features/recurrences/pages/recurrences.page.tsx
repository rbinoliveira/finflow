'use client'

import { useMemo, useState } from 'react'

import { useLedger } from '@/features/ledger/providers/ledger.provider'
import { useTransactionComposer } from '@/features/transactions/providers/transaction-composer.provider'
import { Button } from '@/shared/components/button'
import { Card } from '@/shared/components/card'
import { DataHandler } from '@/shared/components/data-handler'
import { MonthSwitcher } from '@/shared/components/month-switcher'
import { SegmentedControl } from '@/shared/components/segmented-control'
import { currentMonth } from '@/shared/utils/date.util'

import { RecurrenceBillSheet } from '../components/recurrence-bill-sheet'
import { RecurrenceBillsList } from '../components/recurrence-bills-list'
import { RecurrenceRow } from '../components/recurrence-row'
import { RecurrencesSummary } from '../components/recurrences-summary'
import {
  MESSAGE_NO_BILLS_IN_MONTH,
  MESSAGE_NO_RECURRENCES,
  RECURRENCE_TAB_BILLS,
  RECURRENCE_TAB_RULES,
  RECURRENCES_TITLE,
} from '../constants/recurrences.constants'
import type { RecurrenceBill } from '../types/recurrence.type'
import { billsOfMonth, billTotals } from '../utils/recurrence-schedule.util'

type RecurrenceTab = 'bills' | 'rules'

export function RecurrencesPage() {
  const {
    recurrences,
    transactions,
    categories,
    cards,
    loading,
    error,
    reload,
  } = useLedger()

  const { openComposer, editRecurrence } = useTransactionComposer()

  const [tab, setTab] = useState<RecurrenceTab>('bills')
  const [month, setMonth] = useState(currentMonth())
  const [bill, setBill] = useState<RecurrenceBill | null>(null)

  const bills = useMemo(
    () => billsOfMonth(recurrences, transactions, month),
    [recurrences, transactions, month],
  )

  const totals = useMemo(() => billTotals(bills), [bills])

  const openNew = () => openComposer('expense', 'recurring')

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-ink text-xl">{RECURRENCES_TITLE}</h1>
        <Button variant="surface" className="shrink-0" onClick={openNew}>
          Nova
        </Button>
      </header>

      <SegmentedControl<RecurrenceTab>
        label="Visão"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'bills', label: RECURRENCE_TAB_BILLS },
          { value: 'rules', label: RECURRENCE_TAB_RULES },
        ]}
      />

      {tab === 'bills' ? (
        <>
          <MonthSwitcher month={month} onChange={setMonth} />

          <RecurrencesSummary totals={totals} />

          <DataHandler
            loading={loading}
            error={error}
            empty={bills.length === 0}
            emptyMessage={MESSAGE_NO_BILLS_IN_MONTH}
            emptyAction={<Button onClick={openNew}>Criar recorrência</Button>}
            onTryAgain={reload}
          >
            <RecurrenceBillsList
              bills={bills}
              categories={categories}
              onSelect={setBill}
            />
          </DataHandler>
        </>
      ) : (
        <DataHandler
          loading={loading}
          error={error}
          empty={recurrences.length === 0}
          emptyMessage={MESSAGE_NO_RECURRENCES}
          emptyAction={<Button onClick={openNew}>Criar recorrência</Button>}
          onTryAgain={reload}
        >
          <Card className="px-1 py-1">
            {recurrences.map((recurrence) => (
              <RecurrenceRow
                key={recurrence.id}
                recurrence={recurrence}
                category={
                  categories.find(
                    (category) => category.id === recurrence.categoryId,
                  ) ?? null
                }
                cardName={
                  cards.find((card) => card.id === recurrence.cardId)?.name ??
                  null
                }
                onSelect={editRecurrence}
              />
            ))}
          </Card>
        </DataHandler>
      )}

      <RecurrenceBillSheet bill={bill} onClose={() => setBill(null)} />
    </div>
  )
}
