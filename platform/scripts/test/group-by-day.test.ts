import assert from 'node:assert/strict'
import { test } from 'node:test'

import { groupByDay } from '../../../src/features/ledger/utils/ledger-summary.util'
import type { Recurrence } from '../../../src/features/recurrences/types/recurrence.type'
import { billsOfMonth } from '../../../src/features/recurrences/utils/recurrence-schedule.util'
import type { Transaction } from '../../../src/features/transactions/types/transaction.type'

function recorrencia(id: string, dayOfMonth: number): Recurrence {
  return {
    id,
    kind: 'expense',
    description: id,
    amountCents: 8_000,
    categoryId: null,
    method: 'pix',
    cardId: null,
    dayOfMonth,
    everyMonths: 1,
    startMonth: '2026-01',
    endMonth: null,
    status: 'active',
    createdAt: 1,
    updatedAt: 1,
  }
}

function despesa(id: string, date: string, amountCents: number): Transaction {
  return {
    id,
    kind: 'expense',
    description: id,
    amountCents,
    categoryId: null,
    method: 'pix',
    cardId: null,
    date,
    installments: 1,
    paymentDate: null,
    recurrenceId: null,
    createdAt: 1,
    updatedAt: 1,
  }
}

test('conta em aberto entra no dia do vencimento, fora do total', () => {
  const bills = billsOfMonth(
    [recorrencia('futebol', 10), recorrencia('internet', 20)],
    [],
    '2026-09',
  )

  const grupos = groupByDay([despesa('mercado', '2026-09-10', 5_000)], bills)

  assert.deepEqual(
    grupos.map((grupo) => grupo.date),
    ['2026-09-20', '2026-09-10'],
  )

  const [vinte, dez] = grupos

  assert.equal(vinte.transactions.length, 0)
  assert.deepEqual(
    vinte.bills.map((bill) => bill.recurrence.id),
    ['internet'],
  )
  assert.equal(vinte.totalCents, 0)

  assert.equal(dez.transactions.length, 1)
  assert.deepEqual(
    dez.bills.map((bill) => bill.recurrence.id),
    ['futebol'],
  )
  assert.equal(dez.totalCents, -5_000)
})

test('sem contas, agrupa só os lançamentos', () => {
  const grupos = groupByDay([
    despesa('a', '2026-09-01', 1_000),
    despesa('b', '2026-09-01', 2_000),
  ])

  assert.equal(grupos.length, 1)
  assert.deepEqual(grupos[0].bills, [])
  assert.equal(grupos[0].totalCents, -3_000)
})
