'use client'

import { useMemo, useState } from 'react'

import { useLedger } from '@/features/ledger/providers/ledger.provider'
import { Button } from '@/shared/components/button'
import { DataHandler } from '@/shared/components/data-handler'
import { SegmentedControl } from '@/shared/components/segmented-control'

import { CategoriesList } from '../components/categories-list'
import { CategoryFormSheet } from '../components/category-form-sheet'
import { CategoryRemoveDialog } from '../components/category-remove-dialog'
import { MESSAGE_NO_CATEGORIES } from '../constants/categories.constants'
import type { Category, CategoryKind } from '../types/category.type'

export function CategoriesPage() {
  const { categories, loading, error, reload } = useLedger()

  const [kind, setKind] = useState<CategoryKind>('expense')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [removing, setRemoving] = useState<Category | null>(null)

  const doTipo = useMemo(
    () => categories.filter((category) => category.kind === kind),
    [categories, kind],
  )

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-ink text-xl">Categorias</h1>
        <Button
          variant="surface"
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          Nova
        </Button>
      </header>

      <SegmentedControl<CategoryKind>
        label="Tipo"
        value={kind}
        onChange={setKind}
        options={[
          { value: 'expense', label: 'Despesas' },
          { value: 'income', label: 'Receitas' },
        ]}
      />

      <DataHandler
        loading={loading}
        error={error}
        empty={doTipo.length === 0}
        emptyMessage={MESSAGE_NO_CATEGORIES}
        onTryAgain={reload}
      >
        <CategoriesList
          categories={doTipo}
          onSelect={(category) => {
            setEditing(category)
            setOpen(true)
          }}
        />
      </DataHandler>

      <CategoryFormSheet
        open={open}
        kind={kind}
        category={editing}
        onClose={() => setOpen(false)}
        onRemove={setRemoving}
      />

      <CategoryRemoveDialog
        category={removing}
        onClose={() => setRemoving(null)}
      />
    </div>
  )
}
