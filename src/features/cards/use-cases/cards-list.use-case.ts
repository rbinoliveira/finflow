import { listCollectionUseCase } from '@/features/offline/use-cases/collection-repository.use-case'

import type { CreditCard } from '../types/card.type'

export async function listCardsUseCase(uid: string): Promise<CreditCard[]> {
  const cards = await listCollectionUseCase<CreditCard>(uid, 'cards')

  return cards.sort((first, second) =>
    first.name.localeCompare(second.name, 'pt-BR'),
  )
}
