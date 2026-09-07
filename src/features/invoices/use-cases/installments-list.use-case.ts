import { listCollectionUseCase } from '@/features/offline/use-cases/collection-repository.use-case'

import type { Installment } from '../types/installment.type'

export async function listInstallmentsUseCase(
  uid: string,
): Promise<Installment[]> {
  const installments = await listCollectionUseCase<Installment>(
    uid,
    'installments',
  )

  return installments.sort(
    (first, second) =>
      first.dueDate.localeCompare(second.dueDate) || first.number - second.number,
  )
}
