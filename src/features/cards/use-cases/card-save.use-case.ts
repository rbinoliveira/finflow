import { saveDocumentUseCase } from '@/features/offline/use-cases/collection-repository.use-case'
import { createLocalId } from '@/features/offline/utils/local-id.util'

import type { CreditCard, CreditCardInput } from '../types/card.type'

export async function createCardUseCase(
  uid: string,
  input: CreditCardInput,
): Promise<CreditCard> {
  const now = Date.now()

  return saveDocumentUseCase<CreditCard>(
    uid,
    'cards',
    { ...input, id: createLocalId(), createdAt: now, updatedAt: now },
    'create',
  )
}

export async function updateCardUseCase(
  uid: string,
  card: CreditCard,
  input: CreditCardInput,
): Promise<CreditCard> {
  return saveDocumentUseCase<CreditCard>(
    uid,
    'cards',
    { ...card, ...input, updatedAt: Date.now() },
    'update',
  )
}
