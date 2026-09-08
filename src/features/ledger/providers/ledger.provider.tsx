'use client'

import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { listCardsUseCase } from '@/features/cards/use-cases/cards-list.use-case'
import { listCategoriesUseCase } from '@/features/categories/use-cases/categories-list.use-case'
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

      setData({ categories, cards, transactions, installments })
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
     enquanto este estava fora só aparece relendo as coleções. A primeira
     passada é ignorada — a abertura já é coberta pelo efeito acima, e duas
     leituras simultâneas do mesmo estado disputariam a mesma escrita. */
  const primeiraRede = useRef(true)

  useEffect(() => {
    if (primeiraRede.current) {
      primeiraRede.current = false
      return
    }

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
