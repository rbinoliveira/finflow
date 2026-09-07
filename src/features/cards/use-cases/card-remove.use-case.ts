import { removeDocumentUseCase } from '@/features/offline/use-cases/collection-repository.use-case'

export async function removeCardUseCase(
  uid: string,
  id: string,
): Promise<void> {
  await removeDocumentUseCase(uid, 'cards', id)
}
