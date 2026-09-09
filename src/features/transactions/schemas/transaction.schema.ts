import { z } from 'zod'

import { MAX_INSTALLMENTS } from '../constants/transactions.constants'

export const transactionSchema = z
  .object({
    kind: z.enum(['expense', 'income']),
    description: z.string().trim().min(1, 'Descreva o lançamento.').max(80),
    amountCents: z.number().int().positive('Informe um valor maior que zero.'),
    categoryId: z.string().nullable(),
    method: z.enum(['pix', 'card', 'debit', 'cash', 'boleto']),
    cardId: z.string().nullable(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida.'),
    installments: z.number().int().min(1).max(MAX_INSTALLMENTS),
    paymentDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de pagamento inválida.')
      .nullable(),
  })
  .refine((value) => value.method !== 'card' || !!value.cardId, {
    path: ['cardId'],
    message: 'Escolha o cartão da compra.',
  })
  .refine((value) => value.method === 'card' || value.installments === 1, {
    path: ['installments'],
    message: 'Parcelamento só vale para compras no cartão.',
  })
  .refine((value) => value.method === 'card' || value.paymentDate === null, {
    path: ['paymentDate'],
    message: 'Só compra no cartão tem pagamento em outra data.',
  })

export type TransactionSchema = z.infer<typeof transactionSchema>
