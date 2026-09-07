import { saveDocumentUseCase } from '@/features/offline/use-cases/collection-repository.use-case'
import { dayInMonthIso } from '@/shared/utils/date.util'

import type { Installment } from '../types/installment.type'

type AdjustInput = {
  invoiceMonth: string
  dueDay: number
}

/** Mover a parcela de fatura é o mesmo gesto de mudar o dia de pagamento: o
 *  vencimento sempre nasce do mês da fatura mais o dia escolhido. */
export async function adjustInstallmentUseCase(
  uid: string,
  installment: Installment,
  input: AdjustInput,
): Promise<Installment> {
  return saveDocumentUseCase<Installment>(
    uid,
    'installments',
    {
      ...installment,
      invoiceMonth: input.invoiceMonth,
      dueDate: dayInMonthIso(input.invoiceMonth, input.dueDay),
      updatedAt: Date.now(),
    },
    'update',
  )
}
