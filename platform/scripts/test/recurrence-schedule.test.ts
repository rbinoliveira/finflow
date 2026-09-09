import assert from 'node:assert/strict'
import { test } from 'node:test'

import type {
  Recurrence,
  RecurrenceBill,
} from '../../../src/features/recurrences/types/recurrence.type'
import {
  billOverdue,
  billsOfMonth,
  billTotals,
  nextOccurrenceDate,
  occurrenceDate,
  occursInMonth,
  openBills,
} from '../../../src/features/recurrences/utils/recurrence-schedule.util'
import type { Transaction } from '../../../src/features/transactions/types/transaction.type'

function recorrencia(overrides: Partial<Recurrence> = {}): Recurrence {
  return {
    id: 'internet',
    kind: 'expense',
    description: 'Internet',
    amountCents: 9_990,
    categoryId: null,
    method: 'pix',
    cardId: null,
    dayOfMonth: 10,
    everyMonths: 1,
    startMonth: '2026-01',
    endMonth: null,
    status: 'active',
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }
}

function pagamento(
  recurrenceId: string,
  date: string,
  amountCents = 9_990,
): Transaction {
  return {
    id: `pago-${date}`,
    kind: 'expense',
    description: 'Internet',
    amountCents,
    categoryId: null,
    method: 'pix',
    cardId: null,
    date,
    installments: 1,
    recurrenceId,
    createdAt: 1,
    updatedAt: 1,
  }
}

function meses(bills: RecurrenceBill[]): string[] {
  return bills.map((bill) => bill.month)
}

test('a conta aparece num mês futuro sem nada ter sido gerado', () => {
  const bills = billsOfMonth([recorrencia()], [], '2027-05')

  assert.equal(bills.length, 1)
  assert.equal(bills[0].paid, false)
  assert.equal(bills[0].dueDate, '2027-05-10')
})

test('a conta aparece num mês anterior ao de hoje', () => {
  const bills = billsOfMonth([recorrencia()], [], '2026-02')

  assert.deepEqual(meses(bills), ['2026-02'])
})

test('o lançamento do mês marca a ocorrência como paga', () => {
  const bills = billsOfMonth(
    [recorrencia()],
    [pagamento('internet', '2026-03-10')],
    '2026-03',
  )

  assert.equal(bills[0].paid, true)
  assert.equal(bills[0].transactionId, 'pago-2026-03-10')
})

test('o pagamento de um mês não quita o de outro', () => {
  const bills = billsOfMonth(
    [recorrencia()],
    [pagamento('internet', '2026-03-10')],
    '2026-04',
  )

  assert.equal(bills[0].paid, false)
})

test('a conta paga vale o valor que saiu, não o previsto', () => {
  const bills = billsOfMonth(
    [recorrencia()],
    [pagamento('internet', '2026-03-10', 12_500)],
    '2026-03',
  )

  assert.equal(bills[0].amountCents, 12_500)
})

test('seis meses fora deixam seis contas em aberto para marcar', () => {
  const abertas = openBills([recorrencia()], [], '2026-06-20')

  assert.deepEqual(meses(abertas), [
    '2026-01',
    '2026-02',
    '2026-03',
    '2026-04',
    '2026-05',
    '2026-06',
  ])
})

test('o que já foi pago sai da lista de abertas', () => {
  const abertas = openBills(
    [recorrencia()],
    [pagamento('internet', '2026-02-10'), pagamento('internet', '2026-04-10')],
    '2026-05-20',
  )

  assert.deepEqual(meses(abertas), ['2026-01', '2026-03', '2026-05'])
})

test('mês futuro não entra nas abertas', () => {
  const abertas = openBills([recorrencia()], [], '2026-03-20')

  assert.deepEqual(meses(abertas), ['2026-01', '2026-02', '2026-03'])
})

test('a conta do mês corrente fica aberta mesmo antes do dia', () => {
  const abertas = openBills([recorrencia()], [], '2026-03-01')

  assert.deepEqual(meses(abertas), ['2026-01', '2026-02', '2026-03'])
  assert.equal(billOverdue(abertas.at(-1)!, '2026-03-01'), false)
  assert.equal(billOverdue(abertas[0], '2026-03-01'), true)
})

test('recorrência pausada não projeta em mês nenhum', () => {
  const pausada = recorrencia({ status: 'paused' })

  assert.deepEqual(billsOfMonth([pausada], [], '2026-03'), [])
  assert.deepEqual(openBills([pausada], [], '2026-06-20'), [])
})

test('a série para no mês final', () => {
  const conta = recorrencia({ endMonth: '2026-02' })

  assert.deepEqual(billsOfMonth([conta], [], '2026-03'), [])
  assert.deepEqual(meses(openBills([conta], [], '2026-06-20')), [
    '2026-01',
    '2026-02',
  ])
})

test('intervalo maior pula os meses do meio', () => {
  const trimestral = recorrencia({ everyMonths: 3 })

  assert.equal(occursInMonth(trimestral, '2026-04'), true)
  assert.equal(occursInMonth(trimestral, '2026-05'), false)
  assert.deepEqual(meses(openBills([trimestral], [], '2026-08-11')), [
    '2026-01',
    '2026-04',
    '2026-07',
  ])
})

test('dia 31 cai no último dia dos meses curtos', () => {
  const conta = recorrencia({ dayOfMonth: 31 })

  assert.equal(occurrenceDate(conta, '2026-02'), '2026-02-28')
  assert.equal(occurrenceDate(conta, '2026-01'), '2026-01-31')
})

test('próxima cobrança pula o dia que já passou no mês', () => {
  assert.equal(nextOccurrenceDate(recorrencia(), '2026-03-11'), '2026-04-10')
  assert.equal(nextOccurrenceDate(recorrencia(), '2026-03-10'), '2026-03-10')
})

test('próxima cobrança respeita o começo no futuro e o fim', () => {
  assert.equal(
    nextOccurrenceDate(recorrencia({ startMonth: '2026-07' }), '2026-03-11'),
    '2026-07-10',
  )
  assert.equal(
    nextOccurrenceDate(recorrencia({ endMonth: '2026-02' }), '2026-03-11'),
    null,
  )
})

test('o total do mês separa o que falta do que já foi', () => {
  const bills = billsOfMonth(
    [
      recorrencia(),
      recorrencia({
        id: 'aluguel',
        description: 'Aluguel',
        amountCents: 200_000,
      }),
    ],
    [pagamento('internet', '2026-03-10')],
    '2026-03',
  )

  assert.deepEqual(billTotals(bills), {
    incomeCents: 0,
    expenseCents: 209_990,
    openIncomeCents: 0,
    openExpenseCents: 200_000,
  })
})

test('salário recorrente projeta como receita a receber', () => {
  const salario = recorrencia({
    id: 'salario',
    kind: 'income',
    description: 'Salário',
    amountCents: 500_000,
    dayOfMonth: 5,
  })

  const bills = billsOfMonth([salario, recorrencia()], [], '2026-03')

  assert.deepEqual(
    bills.map((bill) => bill.recurrence.id),
    ['salario', 'internet'],
  )
  assert.deepEqual(billTotals(bills), {
    incomeCents: 500_000,
    expenseCents: 9_990,
    openIncomeCents: 500_000,
    openExpenseCents: 9_990,
  })
})

test('receita e despesa não se somam no mesmo número', () => {
  const salario = recorrencia({
    id: 'salario',
    kind: 'income',
    amountCents: 500_000,
  })

  const bills = billsOfMonth([salario, recorrencia()], [], '2026-03')
  const totais = billTotals(bills)

  assert.equal(totais.incomeCents - totais.expenseCents, 490_010)
})

test('receita recebida sai do a receber e fica no previsto', () => {
  const salario = recorrencia({
    id: 'salario',
    kind: 'income',
    amountCents: 500_000,
  })

  const recebido = {
    ...pagamento('salario', '2026-03-10', 512_000),
    kind: 'income' as const,
  }

  const bills = billsOfMonth([salario], [recebido], '2026-03')

  assert.equal(bills[0].paid, true)
  assert.deepEqual(billTotals(bills), {
    incomeCents: 512_000,
    expenseCents: 0,
    openIncomeCents: 0,
    openExpenseCents: 0,
  })
})

test('o aberto do início traz receita e despesa juntas, por vencimento', () => {
  const salario = recorrencia({
    id: 'salario',
    kind: 'income',
    amountCents: 500_000,
    dayOfMonth: 5,
  })

  const abertas = openBills([salario, recorrencia()], [], '2026-02-20')

  assert.deepEqual(
    abertas.map((bill) => `${bill.recurrence.id}:${bill.dueDate}`),
    [
      'salario:2026-01-05',
      'internet:2026-01-10',
      'salario:2026-02-05',
      'internet:2026-02-10',
    ],
  )
})

test('as contas do mês saem ordenadas por vencimento', () => {
  const bills = billsOfMonth(
    [
      recorrencia({ id: 'luz', description: 'Luz', dayOfMonth: 20 }),
      recorrencia({ id: 'agua', description: 'Água', dayOfMonth: 5 }),
    ],
    [],
    '2026-03',
  )

  assert.deepEqual(
    bills.map((bill) => bill.recurrence.id),
    ['agua', 'luz'],
  )
})
