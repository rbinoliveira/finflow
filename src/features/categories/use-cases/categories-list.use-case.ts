import { listCollectionUseCase } from '@/features/offline/use-cases/collection-repository.use-case'

import type { Category } from '../types/category.type'

export async function listCategoriesUseCase(uid: string): Promise<Category[]> {
  const categories = await listCollectionUseCase<Category>(uid, 'categories')

  return categories.sort(
    (first, second) =>
      first.kind.localeCompare(second.kind) ||
      first.name.localeCompare(second.name, 'pt-BR'),
  )
}
