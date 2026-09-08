'use client'

import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { listCardsUseCase } from '@/features/cards/use-cases/cards-list.use-case'
import { listCategoriesUseCase } from '@/features/categories/use-cases/categories-list.use-case'
import { seedCategoriesUseCase } from '@/features/categories/use-cases/categories-seed.use-case'
import { listInstallmentsUseCase } from '@/features/invoices/use-cases/installments-list.use-case'
import { useSync } from '@/features/offline/providers/sync.provider'
import { useUserScope } from '@/features/platform/hooks/user-scope.hook'
import { listTransactionsUseCase } from '@/features/transactions/use-cases/transactions-list.use-case'
import {
  describeFirestoreError,
  logFirestoreError,
} from '@/shared/utils/firestore-error.util'

import type { LedgerData } from '../types/ledger.type'

type LedgerContextValue = LedgerData & {
  uid: string | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

const EMPTY_LEDGER: LedgerData = {
  categories: [],
  cards: [],
  transactions: [],
  installments: [],
}

const LedgerContext = createContext<LedgerContextValue>({
  ...EMPTY_LEDGER,
  uid: null,
  loading: true,
  error: null,
  reload: async () => undefined,
})

type LedgerProviderProps = {
  children: ReactNode
}

export function LedgerProvider({ children }: LedgerProviderProps) {
  const uid = useUserScope()
  const { online, refreshPending } = useSync()
  const [data, setData] = useState<LedgerData>(EMPTY_LEDGER)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!uid) {
      setData(EMPTY_LEDGER)
      setLoading(false)
      return
    }

    setError(null)

    try {
      const [categories, cards, transactions, installments] = await Promise.all(
        [
          listCategoriesUseCase(uid),
          listCardsUseCase(uid),
          listTransactionsUseCase(uid),
          listInstallmentsUseCase(uid),
        ],
      )

      const comPadrao = await seedCategoriesUseCase(uid, categories)

      setData({
        categories:
          comPadrao === categories
            ? categories
            : await listCategoriesUseCase(uid),
        cards,
        transactions,
        installments,
      })
    } catch (caught) {
      logFirestoreError('ledger.provider', caught)
      setError(describeFirestoreError(caught))
    } finally {
      setLoading(false)
      await refreshPending()
    }
  }, [uid, refreshPending])

  useEffect(() => {
    setLoading(true)
    reload().catch(() => undefined)
  }, [reload])

  /* Voltar a ter rede não muda só o envio: o que outro aparelho gravou
     enquanto este estava fora só aparece relendo as coleções. */
  useEffect(() => {
    if (online && uid) reload().catch(() => undefined)
  }, [online, uid, reload])

  const value = useMemo(
    () => ({ ...data, uid, loading, error, reload }),
    [data, uid, loading, error, reload],
  )

  return <LedgerContext value={value}>{children}</LedgerContext>
}

export function useLedger() {
  return use(LedgerContext)
}
