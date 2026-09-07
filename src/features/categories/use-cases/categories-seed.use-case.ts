import { saveManyDocumentsUseCase } from '@/features/offline/use-cases/collection-repository.use-case'
import { createLocalId } from '@/features/offline/utils/local-id.util'

import { DEFAULT_CATEGORIES } from '../constants/categories.constants'
import type { Category } from '../types/category.type'

/** Um app de finanças sem categoria nenhuma na primeira abertura obriga o
 *  usuário a cadastrar antes de lançar o primeiro gasto. */
export async function seedCategoriesUseCase(
  uid: string,
  existing: Category[],
): Promise<Category[]> {
  if (existing.length > 0) return existing

  const now = Date.now()

  const categories = DEFAULT_CATEGORIES.map<Category>((input, index) => ({
    ...input,
    id: createLocalId(),
    createdAt: now + index,
    updatedAt: now + index,
  }))

  return saveManyDocumentsUseCase(uid, 'categories', categories)
}
