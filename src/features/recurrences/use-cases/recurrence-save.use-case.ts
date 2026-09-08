import { saveDocumentUseCase } from '@/features/offline/use-cases/collection-repository.use-case'
import { createLocalId } from '@/features/offline/utils/local-id.util'

import type { Recurrence, RecurrenceInput } from '../types/recurrence.type'

export async function createRecurrenceUseCase(
  uid: string,
  input: RecurrenceInput,
): Promise<Recurrence> {
  const now = Date.now()

  return saveDocumentUseCase<Recurrence>(
    uid,
    'recurrences',
    { ...input, id: createLocalId(), createdAt: now, updatedAt: now },
    'create',
  )
}

export async function updateRecurrenceUseCase(
  uid: string,
  recurrence: Recurrence,
  input: RecurrenceInput,
): Promise<Recurrence> {
  return saveDocumentUseCase<Recurrence>(
    uid,
    'recurrences',
    { ...recurrence, ...input, updatedAt: Date.now() },
    'update',
  )
}
