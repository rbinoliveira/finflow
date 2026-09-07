import { saveDocumentUseCase } from '@/features/offline/use-cases/collection-repository.use-case'
import { createLocalId } from '@/features/offline/utils/local-id.util'

import type { Category, CategoryInput } from '../types/category.type'

export async function createCategoryUseCase(
  uid: string,
  input: CategoryInput,
): Promise<Category> {
  const now = Date.now()

  return saveDocumentUseCase<Category>(
    uid,
    'categories',
    { ...input, id: createLocalId(), createdAt: now, updatedAt: now },
    'create',
  )
}

export async function updateCategoryUseCase(
  uid: string,
  category: Category,
  input: CategoryInput,
): Promise<Category> {
  return saveDocumentUseCase<Category>(
    uid,
    'categories',
    { ...category, ...input, updatedAt: Date.now() },
    'update',
  )
}
