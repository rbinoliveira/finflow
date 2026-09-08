import { z } from 'zod'

import {
  RECURRENCE_INTERVALS,
  RECURRENCE_MAX_DAY,
} from '../constants/recurrences.constants'

const monthPattern = /^\d{4}-\d{2}$/

export const recurrenceSchema = z
  .object({
    kind: z.enum(['expense', 'income']),
    description: z.string().trim().min(1, 'Descreva a recorrência.').max(80),
    amountCents: z.number().int().positive('Informe um valor maior que zero.'),
    categoryId: z.string().nullable(),
    method: z.enum(['pix', 'card', 'debit', 'cash', 'boleto']),
    cardId: z.string().nullable(),
    dayOfMonth: z.number().int().min(1).max(RECURRENCE_MAX_DAY),
    everyMonths: z
      .number()
      .int()
      .refine((value) => RECURRENCE_INTERVALS.includes(value), {
        message: 'Escolha um intervalo válido.',
      }),
    startMonth: z.string().regex(monthPattern, 'Mês inicial inválido.'),
    endMonth: z.string().regex(monthPattern, 'Mês final inválido.').nullable(),
    status: z.enum(['active', 'paused']),
  })
  .refine((value) => value.method !== 'card' || !!value.cardId, {
    path: ['cardId'],
    message: 'Escolha o cartão da cobrança.',
  })
  .refine((value) => !value.endMonth || value.endMonth >= value.startMonth, {
    path: ['endMonth'],
    message: 'O mês final não pode ser antes do inicial.',
  })

export type RecurrenceSchema = z.infer<typeof recurrenceSchema>
