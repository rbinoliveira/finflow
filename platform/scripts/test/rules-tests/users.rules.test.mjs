import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, describe, it } from 'node:test'

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

const ADMIN_EMAIL = 'rubensojunior6@gmail.com'

const ADMIN = 'admin'
const MEMBER = 'liberado'
const PENDING = 'aguardando'

let testEnv

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'finflow-rules-test',
    firestore: {
      host: '127.0.0.1',
      port: 8080,
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  })

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()

    await setDoc(doc(db, `members/${MEMBER}`), {
      email: 'liberado@exemplo.com',
      status: 'approved',
    })
    await setDoc(doc(db, `members/${PENDING}`), {
      email: 'aguardando@exemplo.com',
      status: 'pending',
    })
  })
})

after(async () => {
  await testEnv?.cleanup()
})

function contextOf(uid, email) {
  return testEnv
    .authenticatedContext(uid, { email, email_verified: true })
    .firestore()
}

const adminDb = () => contextOf(ADMIN, ADMIN_EMAIL)
const memberDb = () => contextOf(MEMBER, 'liberado@exemplo.com')
const pendingDb = () => contextOf(PENDING, 'aguardando@exemplo.com')

function transactionDoc(db, uid, id = 'lancamento-1') {
  return doc(db, `users/${uid}/transactions/${id}`)
}

describe('members', () => {
  it('quem chega cria o próprio pedido como pending', async () => {
    const db = contextOf('novo', 'novo@exemplo.com')

    await assertSucceeds(
      setDoc(doc(db, 'members/novo'), {
        email: 'novo@exemplo.com',
        status: 'pending',
      }),
    )
  })

  it('ninguém se auto-aprova nem inventa outro e-mail', async () => {
    const db = contextOf('esperto', 'esperto@exemplo.com')

    await assertFails(
      setDoc(doc(db, 'members/esperto'), {
        email: 'esperto@exemplo.com',
        status: 'approved',
      }),
    )
    await assertFails(
      setDoc(doc(db, 'members/esperto'), {
        email: 'outro@exemplo.com',
        status: 'pending',
      }),
    )
  })

  it('só o admin decide e só ele lista', async () => {
    await assertSucceeds(
      updateDoc(doc(adminDb(), `members/${PENDING}`), { status: 'approved' }),
    )
    await assertFails(
      updateDoc(doc(memberDb(), `members/${PENDING}`), { status: 'approved' }),
    )

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), `members/${PENDING}`), {
        email: 'aguardando@exemplo.com',
        status: 'pending',
      })
    })
  })

  it('cada um lê o próprio documento, e não o dos outros', async () => {
    await assertSucceeds(getDoc(doc(memberDb(), `members/${MEMBER}`)))
    await assertFails(getDoc(doc(memberDb(), `members/${PENDING}`)))
  })

  it('nenhum documento de acesso é apagado', async () => {
    await assertFails(deleteDoc(doc(adminDb(), `members/${MEMBER}`)))
  })
})

describe('users/{uid}', () => {
  it('conta liberada cria e lê o próprio lançamento', async () => {
    const reference = transactionDoc(memberDb(), MEMBER)

    await assertSucceeds(
      setDoc(reference, {
        id: 'lancamento-1',
        kind: 'expense',
        amountCents: 1000,
        createdAt: 1,
        updatedAt: 1,
      }),
    )
    await assertSucceeds(getDoc(reference))
  })

  it('conta aguardando liberação não escreve nada', async () => {
    const reference = transactionDoc(pendingDb(), PENDING)

    await assertFails(setDoc(reference, { id: 'x', createdAt: 1 }))
    await assertFails(getDoc(reference))
  })

  it('conta liberada não alcança o caminho de outra', async () => {
    const reference = transactionDoc(memberDb(), PENDING)

    await assertFails(getDoc(reference))
    await assertFails(setDoc(reference, { id: 'x' }))
  })

  it('nem o admin lê os lançamentos de outra pessoa', async () => {
    await assertFails(getDoc(transactionDoc(adminDb(), MEMBER)))
  })

  it('conta sem login não alcança nada', async () => {
    const db = testEnv.unauthenticatedContext().firestore()

    await assertFails(getDoc(transactionDoc(db, MEMBER)))
    await assertFails(setDoc(transactionDoc(db, MEMBER), { id: 'x' }))
  })

  it('createdAt não pode ser reescrito numa edição', async () => {
    const reference = transactionDoc(memberDb(), MEMBER)

    await assertSucceeds(updateDoc(reference, { amountCents: 2000 }))
    await assertFails(updateDoc(reference, { createdAt: 999 }))
  })

  it('a parcela não pode trocar de compra nem de cartão', async () => {
    const reference = doc(memberDb(), `users/${MEMBER}/installments/parcela-1`)

    await assertSucceeds(
      setDoc(reference, {
        id: 'parcela-1',
        transactionId: 'lancamento-1',
        cardId: 'cartao-1',
        number: 1,
        total: 3,
        amountCents: 1000,
        invoiceMonth: '2026-09',
        dueDate: '2026-09-05',
        paid: false,
        createdAt: 1,
        updatedAt: 1,
      }),
    )

    await assertSucceeds(
      updateDoc(reference, { invoiceMonth: '2026-10', dueDate: '2026-10-05' }),
    )
    await assertSucceeds(updateDoc(reference, { paid: true }))
    await assertFails(updateDoc(reference, { transactionId: 'outra' }))
    await assertFails(updateDoc(reference, { cardId: 'outro' }))
  })

  it('nada existe fora de members e users/{uid}', async () => {
    const reference = doc(memberDb(), 'admin/qualquer')

    await assertFails(getDoc(reference))
    await assertFails(setDoc(reference, { a: 1 }))
  })
})
