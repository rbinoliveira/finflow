'use client'

import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react'

import { TransactionFormSheet } from '../components/transaction-form-sheet'
import type { Transaction, TransactionKind } from '../types/transaction.type'

type ComposerState = {
  open: boolean
  kind: TransactionKind
  transaction: Transaction | null
}

type TransactionComposerValue = {
  openComposer: (kind?: TransactionKind) => void
  editTransaction: (transaction: Transaction) => void
}

const TransactionComposerContext = createContext<TransactionComposerValue>({
  openComposer: () => undefined,
  editTransaction: () => undefined,
})

const CLOSED: ComposerState = {
  open: false,
  kind: 'expense',
  transaction: null,
}

type TransactionComposerProviderProps = {
  children: ReactNode
}

export function TransactionComposerProvider({
  children,
}: TransactionComposerProviderProps) {
  const [state, setState] = useState<ComposerState>(CLOSED)

  const openComposer = useCallback((kind: TransactionKind = 'expense') => {
    setState({ open: true, kind, transaction: null })
  }, [])

  const editTransaction = useCallback((transaction: Transaction) => {
    setState({ open: true, kind: transaction.kind, transaction })
  }, [])

  const close = useCallback(() => setState(CLOSED), [])

  const value = useMemo(
    () => ({ openComposer, editTransaction }),
    [openComposer, editTransaction],
  )

  return (
    <TransactionComposerContext value={value}>
      {children}
      <TransactionFormSheet
        open={state.open}
        kind={state.kind}
        transaction={state.transaction}
        onClose={close}
      />
    </TransactionComposerContext>
  )
}

export function useTransactionComposer() {
  return use(TransactionComposerContext)
}
