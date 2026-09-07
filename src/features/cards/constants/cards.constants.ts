import type { CardBrand } from '../types/card.type'

export const CARD_BRAND_LABEL: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  elo: 'Elo',
  amex: 'Amex',
  hipercard: 'Hipercard',
  other: 'Outra',
}

export const CARD_BRANDS: CardBrand[] = [
  'visa',
  'mastercard',
  'elo',
  'amex',
  'hipercard',
  'other',
]

export const CARD_COLORS = [
  '#7AA2F7',
  '#C77DFF',
  '#4FD1C5',
  '#4ADE80',
  '#FACC15',
  '#FB923C',
  '#F26D8C',
  '#94A3B8',
]

export const MESSAGE_NO_CARDS =
  'Nenhum cartão cadastrado. Adicione um para lançar compras parceladas e acompanhar a fatura.'

export const DEFAULT_CLOSING_DAY = 25
export const DEFAULT_DUE_DAY = 5
