import { removeDocumentUseCase } from '@/features/offline/use-cases/collection-repository.use-case'

export async function removeRecurrenceUseCase(
  uid: string,
  id: string,
): Promise<void> {
  await removeDocumentUseCase(uid, 'recurrences', id)
}
