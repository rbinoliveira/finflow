import { listCollectionUseCase } from '@/features/offline/use-cases/collection-repository.use-case'

import type { CreditCard } from '../types/card.type'

/** Cartão gravado antes de existir tipo é de crédito: era o único que havia.
 *  Normalizar aqui, na única porta de leitura, poupa o resto do app de
 *  perguntar se o campo existe. */
function normalize(card: CreditCard): CreditCard {
  return {
    ...card,
    kind: card.kind ?? 'credit',
    balanceCents: card.balanceCents ?? 0,
    balanceSince: card.balanceSince ?? '',
  }
}

export async function listCardsUseCase(uid: string): Promise<CreditCard[]> {
  const cards = await listCollectionUseCase<CreditCard>(uid, 'cards')

  return cards
    .map(normalize)
    .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'))
}
