export type CategoryKind = 'expense' | 'income'

export type Category = {
  id: string
  name: string
  kind: CategoryKind
  color: string
  emoji: string
  createdAt: number
  updatedAt: number
}

export type CategoryInput = {
  name: string
  kind: CategoryKind
  color: string
  emoji: string
}
