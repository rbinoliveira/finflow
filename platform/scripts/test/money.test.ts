import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  parseMoneyDigits,
  splitCents,
} from '../../../src/shared/utils/money.util'

test('divide o total sem perder centavo', () => {
  const parcelas = splitCents(10_000, 3)

  assert.deepEqual(parcelas, [3334, 3333, 3333])
  assert.equal(
    parcelas.reduce((total, value) => total + value, 0),
    10_000,
  )
})

test('à vista devolve o total inteiro', () => {
  assert.deepEqual(splitCents(4599, 1), [4599])
})

test('lê o valor digitado como centavos', () => {
  assert.equal(parseMoneyDigits('1.234,56'), 123456)
  assert.equal(parseMoneyDigits(''), 0)
})
