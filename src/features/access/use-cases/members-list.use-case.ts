import { getDocs, orderBy, query } from 'firebase/firestore'

import { parseDocuments } from '@/shared/utils/firestore-document.util'

import { memberDocumentSchema } from '../schemas/member.schema'
import type { MemberDocument } from '../types/access.type'
import { membersRef } from '../utils/member-reference.util'

/** Só o admin consegue listar; as regras recusam a leitura para os demais. */
export async function listMembersUseCase(): Promise<MemberDocument[]> {
  const snapshot = await getDocs(query(membersRef(), orderBy('email', 'asc')))

  return parseDocuments(snapshot.docs, memberDocumentSchema)
}
