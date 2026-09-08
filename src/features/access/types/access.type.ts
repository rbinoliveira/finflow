import type { z } from 'zod'

import type {
  accessStatusSchema,
  memberDocumentSchema,
} from '../schemas/member.schema'

export type AccessStatus = z.infer<typeof accessStatusSchema>

export type MemberDocument = z.infer<typeof memberDocumentSchema>

/**
 * `unknown` cobre o intervalo entre entrar na conta e o documento de acesso
 * chegar: sem ele a tela piscaria "não liberado" para quem tem acesso.
 */
export type AccessState = AccessStatus | 'unknown'
