import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  invoiceDueDate,
  resolveInvoiceMonth,
} from '../../../src/features/invoices/utils/invoice-allocation.util'

test('compra antes do fechamento cai na fatura que vence no mesmo mês', () => {
  assert.equal(resolveInvoiceMonth('2026-03-10', 25, 28), '2026-03')
})

test('compra a partir do fechamento vai para a fatura seguinte', () => {
  assert.equal(resolveInvoiceMonth('2026-03-25', 25, 28), '2026-04')
})

test('vencimento antes do fechamento empurra a fatura um mês', () => {
  assert.equal(resolveInvoiceMonth('2026-03-10', 25, 5), '2026-04')
  assert.equal(resolveInvoiceMonth('2026-03-26', 25, 5), '2026-05')
})

test('dia 31 encolhe para o último dia do mês da fatura', () => {
  assert.equal(invoiceDueDate('2026-02', 31), '2026-02-28')
  assert.equal(invoiceDueDate('2026-04', 31), '2026-04-30')
})
