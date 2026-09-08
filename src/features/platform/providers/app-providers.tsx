import type { ReactNode } from 'react'

import { AccessGate } from '@/features/access/components/access-gate'
import { AccessProvider } from '@/features/access/providers/access.provider'
import { LedgerProvider } from '@/features/ledger/providers/ledger.provider'
import { PwaProvider } from '@/features/offline/providers/pwa.provider'
import { SyncProvider } from '@/features/offline/providers/sync.provider'
import { AppSignInGate } from '@/features/platform/components/app-sign-in-gate'
import { FirebaseAuthProvider } from '@/features/platform/providers/firebase-auth.provider'
import { TransactionComposerProvider } from '@/features/transactions/providers/transaction-composer.provider'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <PwaProvider>
      <FirebaseAuthProvider>
        <SyncProvider>
          <AppSignInGate>
            <AccessProvider>
              <AccessGate>
                <LedgerProvider>
                  <TransactionComposerProvider>
                    {children}
                  </TransactionComposerProvider>
                </LedgerProvider>
              </AccessGate>
            </AccessProvider>
          </AppSignInGate>
        </SyncProvider>
      </FirebaseAuthProvider>
    </PwaProvider>
  )
}
