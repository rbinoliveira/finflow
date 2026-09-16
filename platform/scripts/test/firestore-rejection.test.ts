import assert from 'node:assert/strict'
import { test } from 'node:test'

import { isFirestoreRejection } from '../../../src/shared/utils/firestore-error.util'

test('recusa do servidor não é repetida', () => {
  assert.equal(isFirestoreRejection({ code: 'permission-denied' }), true)
  assert.equal(
    isFirestoreRejection({ code: 'firestore/invalid-argument' }),
    true,
  )
})

test('falha de rede ou de token espera a próxima passada', () => {
  assert.equal(isFirestoreRejection({ code: 'unavailable' }), false)
  assert.equal(isFirestoreRejection({ code: 'deadline-exceeded' }), false)
  assert.equal(isFirestoreRejection({ code: 'unauthenticated' }), false)
  assert.equal(isFirestoreRejection(new TypeError('Failed to fetch')), false)
  assert.equal(isFirestoreRejection(null), false)
})
