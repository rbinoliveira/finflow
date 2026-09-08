import type {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore'
import type { z } from 'zod'

export function parseDocument<Schema extends z.ZodType>(
  snapshot: DocumentSnapshot<DocumentData>,
  schema: Schema,
): z.infer<Schema> | null {
  if (!snapshot.exists()) return null

  const parsed = schema.safeParse({ ...snapshot.data(), id: snapshot.id })

  return parsed.success ? parsed.data : null
}

export function parseDocuments<Schema extends z.ZodType>(
  snapshots: QueryDocumentSnapshot<DocumentData>[],
  schema: Schema,
): z.infer<Schema>[] {
  return snapshots
    .map((snapshot) => {
      const parsed = schema.safeParse({ ...snapshot.data(), id: snapshot.id })

      return parsed.success ? parsed.data : null
    })
    .filter((entry): entry is z.infer<Schema> => entry !== null)
}

/** `serverTimestamp()` só vira Timestamp depois que o servidor responde: até
 *  lá o campo chega nulo, e a tela não pode quebrar por causa disso. */
export function timestampToDate(value: Timestamp | null): Date | null {
  return value ? value.toDate() : null
}
