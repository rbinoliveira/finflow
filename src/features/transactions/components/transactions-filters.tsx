'use client'

import type { Category } from '@/features/categories/types/category.type'
import { ChipSelect } from '@/shared/components/chip-select'
import { SegmentedControl } from '@/shared/components/segmented-control'

import type { TransactionKind } from '../types/transaction.type'

export type TransactionFilter = TransactionKind | 'all'

type TransactionsFiltersProps = {
  kind: TransactionFilter
  categoryId: string | null
  categories: Category[]
  onKindChange: (kind: TransactionFilter) => void
  onCategoryChange: (categoryId: string | null) => void
}

export function TransactionsFilters({
  kind,
  categoryId,
  categories,
  onKindChange,
  onCategoryChange,
}: TransactionsFiltersProps) {
  const options = categories
    .filter((category) => kind === 'all' || category.kind === kind)
    .map((category) => ({
      value: category.id,
      label: category.name,
      emoji: category.emoji,
      color: category.color,
    }))

  return (
    <div className="flex flex-col gap-2.5">
      <SegmentedControl<TransactionFilter>
        label="Tipo"
        value={kind}
        onChange={onKindChange}
        options={[
          { value: 'all', label: 'Tudo' },
          { value: 'expense', label: 'Despesas' },
          { value: 'income', label: 'Receitas' },
        ]}
      />

      <ChipSelect
        label="Categoria"
        value={categoryId ?? ''}
        options={[{ value: '', label: 'Todas' }, ...options]}
        onChange={(value) => onCategoryChange(value === '' ? null : value)}
      />
    </div>
  )
}
