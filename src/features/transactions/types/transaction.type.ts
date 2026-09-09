export type TransactionKind = 'expense' | 'income'

/** O que o compositor está escrevendo: um lançamento só, ou a regra que o
 *  repete todo mês. */
export type ComposerMode = 'single' | 'recurring'

export type PaymentMethod = 'pix' | 'card' | 'debit' | 'cash' | 'boleto'

export type Transaction = {
  id: string
  kind: TransactionKind
  description: string
  amountCents: number
  categoryId: string | null
  method: PaymentMethod
  cardId: string | null
  date: string
  installments: number
  /** Quando sai o dinheiro. `date` é o dia da compra; esta é o dia em que ela
   *  será paga — no cartão, o vencimento da fatura em que caiu. Parcelada, é a
   *  primeira: as demais seguem mês a mês no mesmo dia. `null` deixa o cartão
   *  decidir pela data da compra. */
  paymentDate: string | null
  recurrenceId: string | null
  createdAt: number
  updatedAt: number
}

export type TransactionInput = {
  kind: TransactionKind
  description: string
  amountCents: number
  categoryId: string | null
  method: PaymentMethod
  cardId: string | null
  date: string
  installments: number
  paymentDate: string | null
  recurrenceId: string | null
}

export type TransactionGroup = {
  date: string
  totalCents: number
  transactions: Transaction[]
}
