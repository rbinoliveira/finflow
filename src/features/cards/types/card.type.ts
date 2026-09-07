export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'other'

export type CreditCard = {
  id: string
  name: string
  brand: CardBrand
  color: string
  limitCents: number
  closingDay: number
  dueDay: number
  createdAt: number
  updatedAt: number
}

export type CreditCardInput = {
  name: string
  brand: CardBrand
  color: string
  limitCents: number
  closingDay: number
  dueDay: number
}

export type CardUsage = {
  card: CreditCard
  usedCents: number
  availableCents: number
  usedPercent: number
  openInvoiceCents: number
}
