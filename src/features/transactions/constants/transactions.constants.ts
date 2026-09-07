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
