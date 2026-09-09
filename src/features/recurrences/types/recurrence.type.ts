import type {
  PaymentMethod,
  TransactionKind,
} from '@/features/transactions/types/transaction.type'

export type RecurrenceStatus = 'active' | 'paused'

export type Recurrence = {
  id: string
  kind: TransactionKind
  description: string
  amountCents: number
  categoryId: string | null
  method: PaymentMethod
  cardId: string | null
  dayOfMonth: number
  everyMonths: number
  startMonth: string
  endMonth: string | null
  status: RecurrenceStatus
  createdAt: number
  updatedAt: number
}

export type RecurrenceInput = {
  kind: TransactionKind
  description: string
  amountCents: number
  categoryId: string | null
  method: PaymentMethod
  cardId: string | null
  dayOfMonth: number
  everyMonths: number
  startMonth: string
  endMonth: string | null
  status: RecurrenceStatus
}

/**
 * Uma ocorrência da regra num mês. Não existe no banco: nasce da regra na hora
 * de desenhar a tela, e o que está guardado é só o pagamento — o lançamento
 * que carrega o `recurrenceId` daquele mês.
 */
export type RecurrenceBill = {
  recurrence: Recurrence
  month: string
  dueDate: string
  amountCents: number
  paid: boolean
  transactionId: string | null
}

/** Receita e despesa nunca se somam no mesmo número: salário e internet caem
 *  no mesmo mês, mas um entra e o outro sai. */
export type RecurrenceTotals = {
  incomeCents: number
  expenseCents: number
  openIncomeCents: number
  openExpenseCents: number
}
