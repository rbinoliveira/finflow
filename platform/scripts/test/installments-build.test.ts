import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { CreditCard } from '../../../src/features/cards/types/card.type'
import { buildInstallmentsUseCase } from '../../../src/features/invoices/use-cases/installments-build.use-case'
import type { Transaction } from '../../../src/features/transactions/types/transaction.type'

const card: CreditCard = {
  id: 'nubank',
  name: 'Nubank',
  kind: 'credit',
  brand: 'mastercard',
  color: '#C77DFF',
  limitCents: 500_000,
  closingDay: 25,
  dueDay: 5,
  balanceCents: 0,
  balanceSince: '',
  createdAt: 1,
  updatedAt: 1,
}

function compra(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'compra',
    kind: 'expense',
    description: 'Fone',
    amountCents: 30_000,
    categoryId: null,
    method: 'card',
    cardId: 'nubank',
    date: '2026-03-10',
    installments: 1,
    paymentDate: null,
    recurrenceId: null,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }
}

test('sem escolha, o fechamento do cartão decide a fatura', () => {
  const [parcela] = buildInstallmentsUseCase(compra(), card)

  assert.equal(parcela.invoiceMonth, '2026-04')
  assert.equal(parcela.dueDate, '2026-04-05')
})

test('a data do pagamento manda na fatura e no dia', () => {
  const [parcela] = buildInstallmentsUseCase(
    compra({ paymentDate: '2026-05-12' }),
    card,
  )

  assert.equal(parcela.invoiceMonth, '2026-05')
  assert.equal(parcela.dueDate, '2026-05-12')
})

test('a data da compra não se mexe quando o pagamento é empurrado', () => {
  const [parcela] = buildInstallmentsUseCase(
    compra({ paymentDate: '2026-05-05' }),
    card,
  )

  assert.equal(parcela.purchaseDate, '2026-03-10')
  assert.equal(parcela.dueDate, '2026-05-05')
})

test('parceladas seguem mês a mês no dia escolhido', () => {
  const parcelas = buildInstallmentsUseCase(
    compra({ installments: 3, paymentDate: '2026-05-12' }),
    card,
  )

  assert.deepEqual(
    parcelas.map((parcela) => parcela.invoiceMonth),
    ['2026-05', '2026-06', '2026-07'],
  )
  assert.deepEqual(
    parcelas.map((parcela) => parcela.dueDate),
    ['2026-05-12', '2026-06-12', '2026-07-12'],
  )
})

test('dia 31 escolhido encolhe nos meses curtos', () => {
  const parcelas = buildInstallmentsUseCase(
    compra({ installments: 3, paymentDate: '2026-01-31' }),
    card,
  )

  assert.deepEqual(
    parcelas.map((parcela) => parcela.dueDate),
    ['2026-01-31', '2026-02-28', '2026-03-31'],
  )
})

test('o valor continua fechando com o total', () => {
  const parcelas = buildInstallmentsUseCase(
    compra({ amountCents: 10_000, installments: 3 }),
    card,
  )

  assert.equal(
    parcelas.reduce((total, parcela) => total + parcela.amountCents, 0),
    10_000,
  )
})
