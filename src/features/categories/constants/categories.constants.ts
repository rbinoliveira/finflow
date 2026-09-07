import type { CategoryInput, CategoryKind } from '../types/category.type'

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

export const DEFAULT_CATEGORIES: CategoryInput[] = [
  { name: 'Alimentação', kind: 'expense', color: '#FB923C', emoji: '🍽️' },
  { name: 'Mercado', kind: 'expense', color: '#4ADE80', emoji: '🛒' },
  { name: 'Moradia', kind: 'expense', color: '#7AA2F7', emoji: '🏠' },
  { name: 'Transporte', kind: 'expense', color: '#4FD1C5', emoji: '🚗' },
  { name: 'Saúde', kind: 'expense', color: '#F26D8C', emoji: '💊' },
  { name: 'Lazer', kind: 'expense', color: '#C77DFF', emoji: '🎬' },
  { name: 'Assinaturas', kind: 'expense', color: '#94A3B8', emoji: '📱' },
  { name: 'Contas', kind: 'expense', color: '#FACC15', emoji: '💡' },
  { name: 'Salário', kind: 'income', color: '#4ADE80', emoji: '💼' },
  { name: 'Freelance', kind: 'income', color: '#4FD1C5', emoji: '💰' },
  { name: 'Investimentos', kind: 'income', color: '#7AA2F7', emoji: '📈' },
]

export const MESSAGE_NO_CATEGORIES =
  'Nenhuma categoria por aqui ainda. Crie a primeira para organizar seus lançamentos.'
