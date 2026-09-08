import { ADMIN_EMAIL } from '../constants/access.constants'

/** Espelha `isAdmin()` em `firestore.rules`: aquele decide o que a tela
 *  desenha, este decide o que o banco entrega. Mudar um sem o outro deixa a
 *  interface mentindo, nunca abre acesso. */
export function isAdminEmail(email: string | null | undefined): boolean {
  return email?.toLowerCase() === ADMIN_EMAIL
}
