import { serverTimestamp, updateDoc } from 'firebase/firestore'

import type { AccessStatus } from '../types/access.type'
import { memberRef } from '../utils/member-reference.util'

/**
 * Liberar e revogar são a mesma escrita, com `status` diferente: o documento
 * nunca é apagado, para o histórico de quem já teve acesso não sumir.
 */
export async function decideMemberUseCase(
  uid: string,
  status: Extract<AccessStatus, 'approved' | 'blocked'>,
): Promise<void> {
  await updateDoc(memberRef(uid), { status, decidedAt: serverTimestamp() })
}
