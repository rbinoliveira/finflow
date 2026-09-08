import type { Transaction } from '@/features/transactions/types/transaction.type'
import {
  dayInMonthIso,
  daysBetween,
  monthOf,
  monthsBetween,
  shiftMonth,
  todayIso,
} from '@/shared/utils/date.util'

import {
  RECURRENCE_DUE_SOON_DAYS,
  RECURRENCE_MAX_OPEN_MONTHS,
} from '../constants/recurrences.constants'
import type {
  Recurrence,
  RecurrenceBill,
  RecurrenceTotals,
} from '../types/recurrence.type'

function intervalOf(recurrence: Recurrence): number {
  return Math.max(1, Math.trunc(recurrence.everyMonths))
}

/** O dia 31 de uma recorrência cai no último dia dos meses curtos — é o que a
 *  cobrança faz, e não faria sentido a conta de fevereiro pular para março. */
export function occurrenceDate(recurrence: Recurrence, month: string): string {
  return dayInMonthIso(month, recurrence.dayOfMonth)
}

function occurrenceMonthAt(recurrence: Recurrence, index: number): string {
  return shiftMonth(recurrence.startMonth, index * intervalOf(recurrence))
}

function indexUntil(recurrence: Recurrence, month: string): number {
  return Math.floor(
    monthsBetween(recurrence.startMonth, month) / intervalOf(recurrence),
  )
}

export function occursInMonth(recurrence: Recurrence, month: string): boolean {
  if (recurrence.status !== 'active') return false
  if (month < recurrence.startMonth) return false
  if (recurrence.endMonth && month > recurrence.endMonth) return false

  return (
    monthsBetween(recurrence.startMonth, month) % intervalOf(recurrence) === 0
  )
}

/**
 * O pagamento é o lançamento daquele mês carregando o `recurrenceId`. Quem
 * pagou pode ter pago um valor diferente do combinado — luz e água mudam todo
 * mês — então o valor da conta paga é o que saiu, não o que a regra previa.
 */
function billOf(
  recurrence: Recurrence,
  transactions: Transaction[],
  month: string,
): RecurrenceBill {
  const pagamento =
    transactions.find(
      (transaction) =>
        transaction.recurrenceId === recurrence.id &&
        monthOf(transaction.date) === month,
    ) ?? null

  return {
    recurrence,
    month,
    dueDate: occurrenceDate(recurrence, month),
    amountCents: pagamento?.amountCents ?? recurrence.amountCents,
    paid: pagamento !== null,
    transactionId: pagamento?.id ?? null,
  }
}

/** As contas de um mês qualquer — passado, corrente ou futuro. Nada é gerado
 *  para isso existir: a regra responde por todos os meses de uma vez. */
export function billsOfMonth(
  recurrences: Recurrence[],
  transactions: Transaction[],
  month: string,
): RecurrenceBill[] {
  return recurrences
    .filter((recurrence) => occursInMonth(recurrence, month))
    .map((recurrence) => billOf(recurrence, transactions, month))
    .sort(
      (first, second) =>
        first.dueDate.localeCompare(second.dueDate) ||
        first.recurrence.description.localeCompare(
          second.recurrence.description,
          'pt-BR',
        ),
    )
}

/**
 * Tudo que já era para ter sido pago e não foi, do mês inicial da regra até o
 * mês corrente. Quem passou seis meses fora encontra as seis aqui, numa lista
 * só — é isso que faz o acerto ser seis toques em vez de seis navegações.
 */
export function openBills(
  recurrences: Recurrence[],
  transactions: Transaction[],
  referenceIso: string = todayIso(),
): RecurrenceBill[] {
  const mesAtual = monthOf(referenceIso)
  const abertas: RecurrenceBill[] = []

  for (const recurrence of recurrences) {
    if (recurrence.status !== 'active') continue

    const limite =
      recurrence.endMonth && recurrence.endMonth < mesAtual
        ? recurrence.endMonth
        : mesAtual

    if (limite < recurrence.startMonth) continue

    const ultimo = indexUntil(recurrence, limite)
    const primeiro = Math.max(0, ultimo - RECURRENCE_MAX_OPEN_MONTHS + 1)

    for (let index = primeiro; index <= ultimo; index += 1) {
      const bill = billOf(
        recurrence,
        transactions,
        occurrenceMonthAt(recurrence, index),
      )

      if (!bill.paid) abertas.push(bill)
    }
  }

  return abertas.sort((first, second) =>
    first.dueDate.localeCompare(second.dueDate),
  )
}

export function billOverdue(
  bill: RecurrenceBill,
  referenceIso: string = todayIso(),
): boolean {
  return !bill.paid && bill.dueDate < referenceIso
}

export function billDueSoon(
  bill: RecurrenceBill,
  referenceIso: string = todayIso(),
): boolean {
  if (bill.paid) return false

  const dias = daysBetween(referenceIso, bill.dueDate)

  return dias >= 0 && dias <= RECURRENCE_DUE_SOON_DAYS
}

export function nextOccurrenceDate(
  recurrence: Recurrence,
  fromIso: string = todayIso(),
): string | null {
  if (recurrence.status !== 'active') return null

  const intervalo = intervalOf(recurrence)
  const distancia = monthsBetween(recurrence.startMonth, monthOf(fromIso))
  const indice = Math.max(0, Math.ceil(distancia / intervalo))

  for (const month of [
    occurrenceMonthAt(recurrence, indice),
    occurrenceMonthAt(recurrence, indice + 1),
  ]) {
    if (recurrence.endMonth && month > recurrence.endMonth) return null

    const date = occurrenceDate(recurrence, month)

    if (date >= fromIso) return date
  }

  return null
}

export function billTotals(bills: RecurrenceBill[]): RecurrenceTotals {
  const somar = (selecionadas: RecurrenceBill[]) =>
    selecionadas.reduce((total, bill) => total + bill.amountCents, 0)

  const pagas = bills.filter((bill) => bill.paid)

  return {
    paidCents: somar(pagas),
    openCents: somar(bills.filter((bill) => !bill.paid)),
    totalCents: somar(bills),
  }
}
