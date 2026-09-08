import { listCollectionUseCase } from '@/features/offline/use-cases/collection-repository.use-case'

import type { Recurrence } from '../types/recurrence.type'

export async function listRecurrencesUseCase(
  uid: string,
): Promise<Recurrence[]> {
  const recurrences = await listCollectionUseCase<Recurrence>(
    uid,
    'recurrences',
  )

  return recurrences.sort(
    (first, second) =>
      first.dayOfMonth - second.dayOfMonth ||
      first.description.localeCompare(second.description, 'pt-BR'),
  )
}
