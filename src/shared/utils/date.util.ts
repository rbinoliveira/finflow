const MONTH_LABELS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

const WEEKDAY_LABELS = [
  'domingo',
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
]

export function todayIso(): string {
  return toIsoDate(new Date())
}

export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

export function fromIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)

  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

export function addDaysIso(iso: string, days: number): string {
  const date = fromIsoDate(iso)
  date.setDate(date.getDate() + days)

  return toIsoDate(date)
}

export function monthOf(iso: string): string {
  return iso.slice(0, 7)
}

export function currentMonth(): string {
  return monthOf(todayIso())
}

export function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(year, monthNumber - 1 + delta, 1)

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function daysInMonth(month: string): number {
  const [year, monthNumber] = month.split('-').map(Number)

  return new Date(year, monthNumber, 0).getDate()
}

/** Um dia 31 numa fatura de fevereiro tem de virar 28 ou 29, não transbordar
 *  para março — é o que o cartão faz com o vencimento. */
export function dayInMonthIso(month: string, day: number): string {
  const clamped = Math.min(Math.max(1, day), daysInMonth(month))

  return `${month}-${String(clamped).padStart(2, '0')}`
}

/** Em que coluna o dia 1 cai — 0 é domingo, como `Date.getDay()`. É o número
 *  de células vazias que a grade do mês precisa antes de começar. */
export function firstWeekdayOfMonth(month: string): number {
  return fromIsoDate(`${month}-01`).getDay()
}

export function monthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const label = MONTH_LABELS[monthNumber - 1] ?? ''

  return `${label} de ${year}`
}

export function shortMonthLabel(month: string): string {
  const [, monthNumber] = month.split('-').map(Number)

  return (MONTH_LABELS[monthNumber - 1] ?? '').slice(0, 3)
}

export function dayLabel(iso: string): string {
  const date = fromIsoDate(iso)
  const today = todayIso()

  if (iso === today) return 'Hoje'
  if (iso === addDaysIso(today, -1)) return 'Ontem'

  const weekday = WEEKDAY_LABELS[date.getDay()]
  const month = MONTH_LABELS[date.getMonth()]?.slice(0, 3)

  return `${weekday}, ${date.getDate()} de ${month}`
}

export function shortDateLabel(iso: string): string {
  const date = fromIsoDate(iso)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${day}/${month}`
}

export function daysBetween(from: string, to: string): number {
  const inicio = fromIsoDate(from).getTime()
  const fim = fromIsoDate(to).getTime()

  return Math.round((fim - inicio) / 86_400_000)
}

export function daysUntil(iso: string): number {
  return daysBetween(todayIso(), iso)
}

export function monthsBetween(from: string, to: string): number {
  const [fromYear, fromMonth] = from.split('-').map(Number)
  const [toYear, toMonth] = to.split('-').map(Number)

  return (toYear - fromYear) * 12 + (toMonth - fromMonth)
}
