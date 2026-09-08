import { getDoc } from 'firebase/firestore'

import { parseDocument } from '@/shared/utils/firestore-document.util'

import { memberDocumentSchema } from '../schemas/member.schema'
import type { MemberDocument } from '../types/access.type'
import { memberRef } from '../utils/member-reference.util'

export async function getMemberUseCase(
  uid: string,
): Promise<MemberDocument | null> {
  return parseDocument(await getDoc(memberRef(uid)), memberDocumentSchema)
}
