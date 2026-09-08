import type { PaymentMethod, TransactionKind } from '../types/transaction.type'

export const TRANSACTION_KIND_LABEL: Record<TransactionKind, string> = {
  expense: 'Despesa',
  income: 'Receita',
}

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  pix: 'PIX',
  card: 'Cartão',
  debit: 'Débito',
  cash: 'Dinheiro',
  boleto: 'Boleto',
}

export const PAYMENT_METHOD_EMOJI: Record<PaymentMethod, string> = {
  pix: '⚡',
  card: '💳',
  debit: '🏦',
  cash: '💵',
  boleto: '🧾',
}

export const PAYMENT_METHOD_COLOR: Record<PaymentMethod, string> = {
  pix: '#4FD1C5',
  card: '#7AA2F7',
  debit: '#C77DFF',
  cash: '#4ADE80',
  boleto: '#FACC15',
}

export const EXPENSE_METHODS: PaymentMethod[] = [
  'pix',
  'card',
  'debit',
  'cash',
  'boleto',
]

export const INCOME_METHODS: PaymentMethod[] = ['pix', 'cash', 'boleto']

export const MAX_INSTALLMENTS = 24

export const MESSAGE_NO_TRANSACTIONS =
  'Nenhum lançamento neste mês. Toque no + para registrar o primeiro.'
