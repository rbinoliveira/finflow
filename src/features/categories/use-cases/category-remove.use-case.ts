import { removeDocumentUseCase } from '@/features/offline/use-cases/collection-repository.use-case'

export async function removeCategoryUseCase(
  uid: string,
  id: string,
): Promise<void> {
  await removeDocumentUseCase(uid, 'categories', id)
}
