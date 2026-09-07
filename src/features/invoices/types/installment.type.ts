export type Installment = {
  id: string
  transactionId: string
  cardId: string
  number: number
  total: number
  amountCents: number
  description: string
  categoryId: string | null
  purchaseDate: string
  dueDate: string
  invoiceMonth: string
  paid: boolean
  paidAt: number | null
  createdAt: number
  updatedAt: number
}

export type Invoice = {
  cardId: string
  month: string
  dueDate: string
  totalCents: number
  paidCents: number
  openCents: number
  paid: boolean
  installments: Installment[]
}
