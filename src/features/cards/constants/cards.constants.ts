import type { CardBrand, CardKind } from '../types/card.type'

export const CARD_BRAND_LABEL: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  elo: 'Elo',
  amex: 'Amex',
  hipercard: 'Hipercard',
  other: 'Outra',
}

export const CARD_KIND_LABEL: Record<CardKind, string> = {
  credit: 'Crédito',
  meal: 'Alimentação',
}

export const CARD_KINDS: CardKind[] = ['credit', 'meal']

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

export const MESSAGE_BALANCE_HINT =
  'Informe quanto há no cartão hoje; os gastos lançados daqui em diante descontam desse saldo. Quando a recarga do mês entrar, informe o novo valor — ele muda todo mês, então ninguém adivinha por você.'

export const MESSAGE_NO_CARDS =
  'Nenhum cartão cadastrado. Adicione um para lançar compras parceladas e acompanhar a fatura.'

export const DEFAULT_CLOSING_DAY = 25
export const DEFAULT_DUE_DAY = 5
