import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  dayInMonthIso,
  daysInMonth,
  firstWeekdayOfMonth,
} from '../../../src/shared/utils/date.util'

/* Datas conferidas fora do código: 1º de janeiro de 2026 é quinta, 1º de
   fevereiro é domingo e 1º de setembro é terça. */
test('o dia 1 cai na coluna certa da semana', () => {
  assert.equal(firstWeekdayOfMonth('2026-01'), 4)
  assert.equal(firstWeekdayOfMonth('2026-02'), 0)
  assert.equal(firstWeekdayOfMonth('2026-09'), 2)
})

test('o mês tem o número de dias que tem, bissexto incluído', () => {
  assert.equal(daysInMonth('2026-01'), 31)
  assert.equal(daysInMonth('2026-02'), 28)
  assert.equal(daysInMonth('2028-02'), 29)
  assert.equal(daysInMonth('2026-09'), 30)
})

test('a grade cobre o mês inteiro sem furo nem sobra', () => {
  const month = '2026-09'
  const grade = [
    ...Array.from({ length: firstWeekdayOfMonth(month) }, () => null),
    ...Array.from({ length: daysInMonth(month) }, (unused, index) =>
      dayInMonthIso(month, index + 1),
    ),
  ]

  assert.equal(grade.length, 2 + 30)
  assert.equal(grade[0], null)
  assert.equal(grade[2], '2026-09-01')
  assert.equal(grade.at(-1), '2026-09-30')
})

test('o último dia não transborda para o mês seguinte', () => {
  assert.equal(dayInMonthIso('2026-02', 31), '2026-02-28')
  assert.equal(dayInMonthIso('2026-09', 31), '2026-09-30')
})
