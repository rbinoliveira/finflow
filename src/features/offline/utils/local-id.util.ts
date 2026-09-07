const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

export function createLocalId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  }

  let id = ''

  for (let index = 0; index < 20; index += 1) {
    id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }

  return id
}
