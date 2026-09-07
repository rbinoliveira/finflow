import { saveManyDocumentsUseCase } from '@/features/offline/use-cases/collection-repository.use-case'

import type { Installment } from '../types/installment.type'

export async function setInstallmentsPaidUseCase(
  uid: string,
  installments: Installment[],
  paid: boolean,
): Promise<Installment[]> {
  const now = Date.now()

  const atualizadas = installments.map<Installment>((installment) => ({
    ...installment,
    paid,
    paidAt: paid ? now : null,
    updatedAt: now,
  }))

  return saveManyDocumentsUseCase(uid, 'installments', atualizadas)
}
