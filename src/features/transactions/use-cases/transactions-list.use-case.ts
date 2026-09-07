import { listCollectionUseCase } from '@/features/offline/use-cases/collection-repository.use-case'

import type { Transaction } from '../types/transaction.type'

export async function listTransactionsUseCase(
  uid: string,
): Promise<Transaction[]> {
  const transactions = await listCollectionUseCase<Transaction>(
    uid,
    'transactions',
  )

  return transactions.sort(
    (first, second) =>
      second.date.localeCompare(first.date) || second.createdAt - first.createdAt,
  )
}
