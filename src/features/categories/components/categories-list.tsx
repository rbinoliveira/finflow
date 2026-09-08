'use client'

import { Card } from '@/shared/components/card'

import type { Category } from '../types/category.type'

type CategoriesListProps = {
  categories: Category[]
  onSelect: (category: Category) => void
}

export function CategoriesList({ categories, onSelect }: CategoriesListProps) {
  return (
    <Card className="px-1 py-1">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category)}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/3"
        >
          <span
            aria-hidden
            style={{ backgroundColor: `${category.color}1F` }}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-base"
          >
            {category.emoji}
          </span>
          <span className="text-ink flex-1 truncate text-sm font-medium">
            {category.name}
          </span>
          <span aria-hidden className="text-ink-faint text-lg">
            ›
          </span>
        </button>
      ))}
    </Card>
  )
}
