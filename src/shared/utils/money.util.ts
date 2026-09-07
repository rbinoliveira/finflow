const CURRENCY = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const DECIMAL = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatMoney(cents: number): string {
  return CURRENCY.format(cents / 100)
}

export function formatMoneyValue(cents: number): string {
  return DECIMAL.format(cents / 100)
}

export function formatSignedMoney(cents: number): string {
  const sign = cents > 0 ? '+' : cents < 0 ? '−' : ''

  return `${sign}${CURRENCY.format(Math.abs(cents) / 100)}`
}

export function parseMoneyDigits(input: string): number {
  const digits = input.replace(/\D/g, '').slice(0, 12)

  return digits.length === 0 ? 0 : Number(digits)
}

/** Divide o total em N parcelas sem perder centavo: o resto vai para as
 *  primeiras, que é como a fatura do cartão costuma cobrar. */
export function splitCents(total: number, parts: number): number[] {
  const safeParts = Math.max(1, Math.trunc(parts))
  const base = Math.floor(total / safeParts)
  const remainder = total - base * safeParts

  return Array.from({ length: safeParts }, (unused, index) =>
    index < remainder ? base + 1 : base,
  )
}
