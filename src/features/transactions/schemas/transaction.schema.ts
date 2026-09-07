import { z } from 'zod'

import { MAX_INSTALLMENTS } from '../constants/transactions.constants'

export const transactionSchema = z
  .object({
    kind: z.enum(['expense', 'income']),
    description: z.string().trim().min(1, 'Descreva o lançamento.').max(80),
    amountCents: z.number().int().positive('Informe um valor maior que zero.'),
    categoryId: z.string().min(1, 'Escolha uma categoria.'),
    method: z.enum(['pix', 'card', 'debit', 'cash', 'boleto']),
    cardId: z.string().nullable(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida.'),
    installments: z.number().int().min(1).max(MAX_INSTALLMENTS),
  })
  .refine((value) => value.method !== 'card' || !!value.cardId, {
    path: ['cardId'],
    message: 'Escolha o cartão da compra.',
  })
  .refine((value) => value.method === 'card' || value.installments === 1, {
    path: ['installments'],
    message: 'Parcelamento só vale para compras no cartão.',
  })

export type TransactionSchema = z.infer<typeof transactionSchema>
