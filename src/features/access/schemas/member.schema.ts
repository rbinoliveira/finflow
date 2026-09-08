import { Timestamp } from 'firebase/firestore'
import { z } from 'zod'

import { ACCESS_STATUS } from '../constants/access.constants'

export const accessStatusSchema = z.enum(ACCESS_STATUS)

const firestoreTimestampSchema = z.instanceof(Timestamp)

/**
 * `requestedAt` é gravado pelo próprio usuário no primeiro login e `decidedAt`
 * só pelo admin. Entre a escrita e a resposta do servidor os dois chegam nulos,
 * então nenhum pode ser obrigatório na leitura.
 */
export const memberDocumentSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(1),
  status: accessStatusSchema,
  requestedAt: firestoreTimestampSchema.nullable().default(null),
  decidedAt: firestoreTimestampSchema.nullable().default(null),
})
