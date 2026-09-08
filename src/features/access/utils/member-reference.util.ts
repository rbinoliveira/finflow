import {
  collection,
  type CollectionReference,
  doc,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore'

import { db } from '@/shared/libs/firebase'

import { COLLECTION_MEMBERS } from '../constants/access.constants'

export function membersRef(): CollectionReference<DocumentData> {
  return collection(db, COLLECTION_MEMBERS)
}

export function memberRef(uid: string): DocumentReference<DocumentData> {
  return doc(db, COLLECTION_MEMBERS, uid)
}
