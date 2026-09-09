export type CardBrand =
  'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'other'

export type CardKind = 'credit' | 'meal'

/** Crédito e alimentação são o mesmo objeto porque são a mesma escolha na hora
 *  de lançar. O que muda é o que cada um responde: um tem fatura, o outro tem
 *  saldo — os campos do outro tipo ficam zerados. */
export type CreditCard = {
  id: string
  name: string
  kind: CardKind
  brand: CardBrand
  color: string
  limitCents: number
  closingDay: number
  dueDay: number
  /** Saldo informado pela pessoa. O saldo de agora é este menos o que foi
   *  gasto de `balanceSince` para cá — recarregou, informa de novo. */
  balanceCents: number
  balanceSince: string
  createdAt: number
  updatedAt: number
}

export type CreditCardInput = {
  name: string
  kind: CardKind
  brand: CardBrand
  color: string
  limitCents: number
  closingDay: number
  dueDay: number
  balanceCents: number
  balanceSince: string
}

export type CardUsage = {
  card: CreditCard
  usedCents: number
  availableCents: number
  usedPercent: number
  openInvoiceCents: number
}
