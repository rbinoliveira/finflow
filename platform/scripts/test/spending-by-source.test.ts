import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { CreditCard } from '../../../src/features/cards/types/card.type'
import { spendingBySource } from '../../../src/features/ledger/utils/ledger-summary.util'
import type { Transaction } from '../../../src/features/transactions/types/transaction.type'

const cards: CreditCard[] = [
  {
    id: 'nubank',
    name: 'Nubank',
    brand: 'mastercard',
    color: '#C77DFF',
    limitCents: 500_000,
    closingDay: 25,
    dueDay: 5,
    createdAt: 1,
    updatedAt: 1,
  },
  {
    id: 'inter',
    name: 'Inter',
    brand: 'visa',
    color: '#FB923C',
    limitCents: 300_000,
    closingDay: 20,
    dueDay: 1,
    createdAt: 1,
    updatedAt: 1,
  },
]

function despesa(
  id: string,
  amountCents: number,
  method: Transaction['method'],
  cardId: string | null = null,
): Transaction {
  return {
    id,
    kind: 'expense',
    description: id,
    amountCents,
    categoryId: null,
    method,
    cardId,
    date: '2026-09-10',
    installments: 1,
    createdAt: 1,
    updatedAt: 1,
  }
}

test('separa cada cartão e mantém PIX ao lado', () => {
  const slices = spendingBySource(
    [
      despesa('a', 10_000, 'card', 'nubank'),
      despesa('b', 5_000, 'card', 'inter'),
      despesa('c', 5_000, 'pix'),
    ],
    cards,
  )

  assert.deepEqual(
    slices.map((slice) => [slice.name, slice.totalCents]),
    [
      ['Nubank', 10_000],
      ['Inter', 5_000],
      ['PIX', 5_000],
    ],
  )
})

test('soma as compras do mesmo cartão numa fatia só', () => {
  const slices = spendingBySource(
    [
      despesa('a', 10_000, 'card', 'nubank'),
      despesa('b', 2_500, 'card', 'nubank'),
    ],
    cards,
  )

  assert.equal(slices.length, 1)
  assert.equal(slices[0].totalCents, 12_500)
  assert.equal(slices[0].percent, 100)
})

test('cada fatia herda a cor do próprio cartão', () => {
  const slices = spendingBySource([despesa('a', 100, 'card', 'inter')], cards)

  assert.equal(slices[0].color, '#FB923C')
})

test('receita não entra na conta', () => {
  const receita: Transaction = {
    ...despesa('salario', 900_000, 'pix'),
    kind: 'income',
  }

  const slices = spendingBySource([receita, despesa('a', 1_000, 'pix')], cards)

  assert.equal(slices.length, 1)
  assert.equal(slices[0].totalCents, 1_000)
})

test('cartão apagado não derruba a tela', () => {
  const slices = spendingBySource([despesa('a', 1_000, 'card', 'sumiu')], cards)

  assert.equal(slices[0].name, 'Cartão removido')
})

test('as duas quebras somam o mesmo total do mês', () => {
  const despesas = [
    despesa('a', 10_000, 'card', 'nubank'),
    despesa('b', 3_000, 'pix'),
    despesa('c', 700, 'cash'),
  ]

  const total = spendingBySource(despesas, cards).reduce(
    (soma, slice) => soma + slice.totalCents,
    0,
  )

  assert.equal(total, 13_700)
})
