'use client'

import { useLedger } from '@/features/ledger/providers/ledger.provider'
import { Button } from '@/shared/components/button'
import { Dialog } from '@/shared/components/dialog'

import type { Category } from '../types/category.type'
import { removeCategoryUseCase } from '../use-cases/category-remove.use-case'

type CategoryRemoveDialogProps = {
  category: Category | null
  onClose: () => void
}

export function CategoryRemoveDialog({
  category,
  onClose,
}: CategoryRemoveDialogProps) {
  const { uid, transactions, reload } = useLedger()

  const emUso = category
    ? transactions.some((transaction) => transaction.categoryId === category.id)
    : false

  const remove = async () => {
    if (!uid || !category) return

    await removeCategoryUseCase(uid, category.id)
    await reload()
    onClose()
  }

  return (
    <Dialog
      open={category !== null}
      title="Remover categoria"
      description={
        emUso
          ? 'Existem lançamentos nesta categoria. Eles ficam sem categoria depois da remoção.'
          : 'Esta categoria deixa de aparecer nos novos lançamentos.'
      }
      onClose={onClose}
    >
      <div className="mt-5 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="danger" className="flex-1" onClick={remove}>
          Remover
        </Button>
      </div>
    </Dialog>
  )
}
