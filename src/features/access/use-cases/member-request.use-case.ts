import { serverTimestamp, setDoc } from 'firebase/firestore'

import { memberRef } from '../utils/member-reference.util'

/**
 * O pedido nasce sempre `pending`, e as regras do Firestore recusam qualquer
 * outro `status` na criação — quem entra não se auto-aprova.
 */
export async function requestAccessUseCase(
  uid: string,
  email: string,
): Promise<void> {
  await setDoc(memberRef(uid), {
    email,
    status: 'pending',
    requestedAt: serverTimestamp(),
    decidedAt: null,
  })
}
