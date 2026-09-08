import type { CategoryKind } from '../types/category.type'

export const CATEGORY_KIND_LABEL: Record<CategoryKind, string> = {
  expense: 'Despesa',
  income: 'Receita',
}

export const CATEGORY_COLORS = [
  '#F26D8C',
  '#C77DFF',
  '#7AA2F7',
  '#4FD1C5',
  '#4ADE80',
  '#FACC15',
  '#FB923C',
  '#94A3B8',
]

export const CATEGORY_EMOJIS = [
  '🍽️',
  '🛒',
  '🏠',
  '🚗',
  '⛽',
  '💊',
  '🎬',
  '✈️',
  '📚',
  '👕',
  '🐶',
  '💡',
  '📱',
  '🎁',
  '💼',
  '💰',
  '📈',
  '🧾',
]

export const MESSAGE_NO_CATEGORIES =
  'Nenhuma categoria por aqui ainda. Crie a primeira para organizar seus lançamentos.'

export const MESSAGE_CATEGORY_OPTIONAL =
  'Sem categoria cadastrada. O lançamento fica em “Sem categoria” — crie as suas em Ajustes.'

export const UNCATEGORIZED_LABEL = 'Sem categoria'
