import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { CreditCard } from '../../../src/features/cards/types/card.type'
import { buildCardUsage } from '../../../src/features/cards/utils/card-usage.util'
import type { Installment } from '../../../src/features/invoices/types/installment.type'
import type { Transaction } from '../../../src/features/transactions/types/transaction.type'

function cartao(overrides: Partial<CreditCard> = {}): CreditCard {
  return {
    id: 'alelo',
    name: 'Alelo',
    kind: 'meal',
    brand: 'other',
    color: '#4ADE80',
    limitCents: 0,
    closingDay: 1,
    dueDay: 1,
    balanceCents: 60_000,
    balanceSince: '2026-09-01',
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }
}

function parcela(cardId: string, amountCents: number): Installment {
  return {
    id: `p-${cardId}`,
    transactionId: 't1',
    cardId,
    number: 1,
    total: 1,
    amountCents,
    description: 'compra',
    categoryId: null,
    purchaseDate: '2026-09-05',
    dueDate: '2026-10-05',
    invoiceMonth: '2026-10',
    paid: false,
    paidAt: null,
    createdAt: 1,
    updatedAt: 1,
  }
}

function despesa(
  id: string,
  amountCents: number,
  date: string,
  cardId = 'alelo',
): Transaction {
  return {
    id,
    kind: 'expense',
    description: id,
    amountCents,
    categoryId: null,
    method: 'card',
    cardId,
    date,
    installments: 1,
    paymentDate: null,
    recurrenceId: null,
    createdAt: 1,
    updatedAt: 1,
  }
}

test('o saldo do alimentação é o informado menos o que se gastou', () => {
  const usage = buildCardUsage(
    cartao(),
    [],
    [despesa('a', 12_000, '2026-09-05'), despesa('b', 8_000, '2026-09-09')],
  )

  assert.equal(usage.usedCents, 20_000)
  assert.equal(usage.availableCents, 40_000)
})

test('gastar mais do que havia deixa o saldo negativo', () => {
  const usage = buildCardUsage(
    cartao(),
    [],
    [despesa('estouro', 90_000, '2026-09-05')],
  )

  assert.equal(usage.usedCents, 90_000)
  assert.equal(usage.availableCents, -30_000)
})

test('informar um saldo novo recomeça a contagem dali', () => {
  const gastos = [
    despesa('set-1', 55_000, '2026-09-10'),
    despesa('out-1', 12_000, '2026-10-03'),
  ]

  const setembro = buildCardUsage(cartao(), [], gastos)

  assert.equal(setembro.usedCents, 67_000)
  assert.equal(setembro.availableCents, -7_000)

  const outubro = buildCardUsage(
    cartao({ balanceCents: 45_000, balanceSince: '2026-10-01' }),
    [],
    gastos,
  )

  assert.equal(outubro.usedCents, 12_000)
  assert.equal(outubro.availableCents, 33_000)
})

test('gasto anterior à informação do saldo não desconta de novo', () => {
  const usage = buildCardUsage(
    cartao(),
    [],
    [
      despesa('antiga', 50_000, '2026-08-20'),
      despesa('nova', 10_000, '2026-09-05'),
    ],
  )

  assert.equal(usage.usedCents, 10_000)
  assert.equal(usage.availableCents, 50_000)
})

test('gasto no mesmo dia da recarga entra na contagem nova', () => {
  const usage = buildCardUsage(
    cartao(),
    [],
    [despesa('mesmo-dia', 10_000, '2026-09-01')],
  )

  assert.equal(usage.usedCents, 10_000)
})

test('gasto de outro cartão não toca o saldo', () => {
  const usage = buildCardUsage(
    cartao(),
    [],
    [despesa('nubank', 30_000, '2026-09-05', 'nubank')],
  )

  assert.equal(usage.usedCents, 0)
  assert.equal(usage.availableCents, 60_000)
})

test('receita lançada no cartão não vira saldo gasto', () => {
  const estorno = {
    ...despesa('estorno', 5_000, '2026-09-05'),
    kind: 'income' as const,
  }

  assert.equal(buildCardUsage(cartao(), [], [estorno]).usedCents, 0)
})

test('alimentação nunca reporta fatura em aberto', () => {
  const usage = buildCardUsage(cartao(), [parcela('alelo', 10_000)], [])

  assert.equal(usage.openInvoiceCents, 0)
})

test('crédito segue medindo pelo limite e pelas parcelas abertas', () => {
  const credito = cartao({
    id: 'nubank',
    kind: 'credit',
    limitCents: 100_000,
    balanceCents: 0,
    balanceSince: '',
  })

  const usage = buildCardUsage(credito, [parcela('nubank', 25_000)], [])

  assert.equal(usage.usedCents, 25_000)
  assert.equal(usage.availableCents, 75_000)
  assert.equal(usage.usedPercent, 25)
})
