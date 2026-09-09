'use client'

import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react'

import type { Recurrence } from '@/features/recurrences/types/recurrence.type'

import { TransactionComposerSheet } from '../components/transaction-composer-sheet'
import type {
  ComposerMode,
  Transaction,
  TransactionKind,
} from '../types/transaction.type'

type ComposerState = {
  open: boolean
  mode: ComposerMode
  kind: TransactionKind
  transaction: Transaction | null
  recurrence: Recurrence | null
}

type TransactionComposerValue = {
  openComposer: (kind?: TransactionKind, mode?: ComposerMode) => void
  editTransaction: (transaction: Transaction) => void
  editRecurrence: (recurrence: Recurrence) => void
}

const TransactionComposerContext = createContext<TransactionComposerValue>({
  openComposer: () => undefined,
  editTransaction: () => undefined,
  editRecurrence: () => undefined,
})

const CLOSED: ComposerState = {
  open: false,
  mode: 'single',
  kind: 'expense',
  transaction: null,
  recurrence: null,
}

type TransactionComposerProviderProps = {
  children: ReactNode
}

export function TransactionComposerProvider({
  children,
}: TransactionComposerProviderProps) {
  const [state, setState] = useState<ComposerState>(CLOSED)

  const openComposer = useCallback(
    (kind: TransactionKind = 'expense', mode: ComposerMode = 'single') => {
      setState({
        open: true,
        mode,
        kind,
        transaction: null,
        recurrence: null,
      })
    },
    [],
  )

  const editTransaction = useCallback((transaction: Transaction) => {
    setState({
      open: true,
      mode: 'single',
      kind: transaction.kind,
      transaction,
      recurrence: null,
    })
  }, [])

  const editRecurrence = useCallback((recurrence: Recurrence) => {
    setState({
      open: true,
      mode: 'recurring',
      kind: recurrence.kind,
      transaction: null,
      recurrence,
    })
  }, [])

  const changeMode = useCallback((mode: ComposerMode) => {
    setState((current) => ({ ...current, mode }))
  }, [])

  const close = useCallback(() => setState(CLOSED), [])

  const value = useMemo(
    () => ({ openComposer, editTransaction, editRecurrence }),
    [openComposer, editTransaction, editRecurrence],
  )

  return (
    <TransactionComposerContext value={value}>
      {children}
      <TransactionComposerSheet
        open={state.open}
        mode={state.mode}
        kind={state.kind}
        transaction={state.transaction}
        recurrence={state.recurrence}
        onModeChange={changeMode}
        onClose={close}
      />
    </TransactionComposerContext>
  )
}

export function useTransactionComposer() {
  return use(TransactionComposerContext)
}
