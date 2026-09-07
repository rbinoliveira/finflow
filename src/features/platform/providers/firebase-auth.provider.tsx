'use client'

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { auth } from '@/shared/libs/firebase'

type AuthStatus = 'loading' | 'sign-in' | 'ready'

type FirebaseAuthContextValue = {
  status: AuthStatus
  user: User | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const FirebaseAuthContext = createContext<FirebaseAuthContextValue>({
  status: 'loading',
  user: null,
  signIn: async () => undefined,
  signOut: async () => undefined,
})

const provider = new GoogleAuthProvider()
provider.addScope('email')

type FirebaseAuthProviderProps = {
  children: ReactNode
}

export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)

  useEffect(
    () =>
      onAuthStateChanged(auth, (nextUser) => {
        setUser(nextUser)
        setStatus(nextUser ? 'ready' : 'sign-in')
      }),
    [],
  )

  const signIn = useCallback(async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch {
      await signInWithRedirect(auth, provider)
    }
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
  }, [])

  const value = useMemo(
    () => ({ status, user, signIn, signOut }),
    [status, user, signIn, signOut],
  )

  return <FirebaseAuthContext value={value}>{children}</FirebaseAuthContext>
}

export function useFirebaseAuth() {
  return use(FirebaseAuthContext)
}
